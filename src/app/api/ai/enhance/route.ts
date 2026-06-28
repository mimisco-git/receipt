import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { text, context } = await req.json();
    if (!text?.trim()) return NextResponse.json({ error: "No text provided" }, { status: 400 });

    const prompt = `Improve this ${context || "description"} for a freelance platform. Make it more specific, professional, and compelling. Keep the same intent but improve clarity, specificity, and detail. Return ONLY the improved text — no preamble, no explanation, no quotes.

Original:
${text}`;

    const nvidiaKey = process.env.NVIDIA_API_KEY;
    const groqKey   = process.env.GROQ_API_KEY;
    const anthropicKey = process.env.ANTHROPIC_API_KEY;

    if (nvidiaKey) {
      try {
        const res = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${nvidiaKey}` },
          body: JSON.stringify({
            model: "meta/llama-3.3-70b-instruct",
            max_tokens: 400, temperature: 0.65,
            messages: [{ role: "user", content: prompt }],
          }),
        });
        if (res.ok) {
          const d = await res.json();
          const enhanced = d.choices?.[0]?.message?.content?.trim();
          if (enhanced) return NextResponse.json({ enhanced, model: "nvidia/llama-3.3-70b" });
        }
      } catch {}
    }

    if (groqKey) {
      try {
        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${groqKey}` },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            max_tokens: 400, temperature: 0.65,
            messages: [{ role: "user", content: prompt }],
          }),
        });
        if (res.ok) {
          const d = await res.json();
          const enhanced = d.choices?.[0]?.message?.content?.trim();
          if (enhanced) return NextResponse.json({ enhanced, model: "groq/llama-3.3-70b" });
        }
      } catch {}
    }

    if (anthropicKey) {
      try {
        const res = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-api-key": anthropicKey, "anthropic-version": "2023-06-01" },
          body: JSON.stringify({
            model: "claude-sonnet-4-6", max_tokens: 400,
            messages: [{ role: "user", content: prompt }],
          }),
        });
        if (res.ok) {
          const d = await res.json();
          const enhanced = d.content?.[0]?.text?.trim();
          if (enhanced) return NextResponse.json({ enhanced, model: "claude-sonnet-4-6" });
        }
      } catch {}
    }

    return NextResponse.json({ enhanced: text, model: "passthrough" });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Unknown error" }, { status: 500 });
  }
}
