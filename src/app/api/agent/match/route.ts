import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { brief, serviceId } = await req.json();
    if (!brief) return NextResponse.json({ matches: [] });

    const { db } = await import("@/lib/db");

    const workers = await db.freelancer.findMany({
      where: {
        services: { some: { isActive: true, type: "service" } },
        NOT: { walletAddress: { startsWith: "pending" } },
      },
      include: {
        services: {
          where: { isActive: true, type: "service" },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        _count: { select: { contracts: true } },
      },
      take: 20,
    });

    if (workers.length === 0) return NextResponse.json({ matches: [] });

    const workerList = workers.map(w => ({
      name: w.name,
      bio: w.bio || "",
      title: w.services[0]?.title || "",
      description: w.services[0]?.description?.slice(0, 200) || "",
      jobsDone: w._count.contracts,
      slug: w.services[0]?.slug || "",
    })).filter(w => w.slug);

    if (workerList.length === 0) return NextResponse.json({ matches: [] });

    const prompt = `You are matching freelancers to a job listing.

Job requirements:
"""
${brief.slice(0, 600)}
"""

Available workers:
${workerList.map((w, i) => `${i + 1}. ${w.name}${w.bio ? ` — ${w.bio}` : ""}
   Service: ${w.title}
   Description: ${w.description}`).join("\n\n")}

Select the top ${Math.min(3, workerList.length)} most relevant workers. Return ONLY valid JSON array:
[{"index": <1-based number>, "reason": "<one sentence why they match this specific job>"}]`;

    const tryParse = (text: string) => {
      try {
        const clean = text.replace(/```json|```/g, "").replace(/^[\s\S]*?(\[)/, "$1").replace(/\][^]*$/, "]");
        return JSON.parse(clean) as { index: number; reason: string }[];
      } catch { return null; }
    };

    const nvidiaKey = process.env.NVIDIA_API_KEY;
    const groqKey   = process.env.GROQ_API_KEY;
    const anthropicKey = process.env.ANTHROPIC_API_KEY;

    let ranked: { index: number; reason: string }[] | null = null;

    if (nvidiaKey && !ranked) {
      try {
        const res = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${nvidiaKey}` },
          body: JSON.stringify({ model: "meta/llama-3.3-70b-instruct", max_tokens: 300, temperature: 0.2, messages: [{ role: "user", content: prompt }] }),
        });
        if (res.ok) { const d = await res.json(); ranked = tryParse(d.choices?.[0]?.message?.content || ""); }
      } catch {}
    }

    if (groqKey && !ranked) {
      try {
        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${groqKey}` },
          body: JSON.stringify({ model: "llama-3.3-70b-versatile", max_tokens: 300, temperature: 0.2, messages: [{ role: "user", content: prompt }] }),
        });
        if (res.ok) { const d = await res.json(); ranked = tryParse(d.choices?.[0]?.message?.content || ""); }
      } catch {}
    }

    if (anthropicKey && !ranked) {
      try {
        const res = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-api-key": anthropicKey, "anthropic-version": "2023-06-01" },
          body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 300, messages: [{ role: "user", content: prompt }] }),
        });
        if (res.ok) { const d = await res.json(); ranked = tryParse(d.content?.[0]?.text || ""); }
      } catch {}
    }

    // Fallback: top 3 in order
    if (!ranked || ranked.length === 0) {
      ranked = workerList.slice(0, 3).map((_, i) => ({ index: i + 1, reason: "Active worker with relevant experience." }));
    }

    const matches = ranked
      .filter(m => m.index >= 1 && m.index <= workerList.length)
      .map(m => ({ ...workerList[m.index - 1], reason: m.reason }))
      .slice(0, 3);

    void serviceId; // unused but part of interface
    return NextResponse.json({ matches });
  } catch (err) {
    return NextResponse.json({ matches: [], error: err instanceof Error ? err.message : "Unknown" });
  }
}
