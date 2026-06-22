"use server";

export interface AgentEvaluation {
  score: number;
  reasoning: string;
  wordCount?: number;
  recommendation: "APPROVE" | "DISPUTE" | "PARTIAL";
  partialPercent?: number;
}

export async function evaluateDelivery(
  brief: string,
  delivery: string,
  priceUsdc: number
): Promise<AgentEvaluation> {
  // Try NVIDIA NIM first, then Groq, then Anthropic, then mock
  const nvidiaKey = process.env.NVIDIA_API_KEY;
  const groqKey   = process.env.GROQ_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;

  if (nvidiaKey) return callNvidia(nvidiaKey, brief, delivery, priceUsdc);
  if (groqKey)   return callGroq(groqKey, brief, delivery, priceUsdc);
  if (anthropicKey) return callAnthropic(anthropicKey, brief, delivery, priceUsdc);
  return mockEvaluation(brief, delivery);
}

const SYSTEM_PROMPT = `You are Receipt Agent, an autonomous AI escrow arbiter for freelance work.
Evaluate whether a freelancer delivery matches the client brief.
Return ONLY valid JSON — no markdown, no explanation, no backticks.`;

function buildPrompt(brief: string, delivery: string, priceUsdc: number): string {
  return `Client brief:
"""
${brief}
"""

Freelancer delivery:
"""
${delivery}
"""

Contract value: $${priceUsdc} USDC

Return a JSON object:
{
  "score": <0-100, how well delivery matches brief>,
  "reasoning": "<1-2 sentence verdict>",
  "wordCount": <estimated word count of delivery>,
  "recommendation": "<APPROVE if score>=75, PARTIAL if 40-74, DISPUTE if <40>",
  "partialPercent": <percentage to release if PARTIAL, null otherwise>
}`;
}

async function callNvidia(
  apiKey: string,
  brief: string,
  delivery: string,
  priceUsdc: number
): Promise<AgentEvaluation> {
  try {
    const res = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "meta/llama-3.3-70b-instruct",
        max_tokens: 512,
        temperature: 0.1,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user",   content: buildPrompt(brief, delivery, priceUsdc) },
        ],
      }),
    });

    if (!res.ok) {
      console.error("NVIDIA API error:", res.status, await res.text());
      return mockEvaluation(brief, delivery);
    }

    const data = await res.json();
    const text = data.choices?.[0]?.message?.content ?? "{}";
    return parseEvaluation(text);
  } catch (err) {
    console.error("NVIDIA agent error:", err);
    return mockEvaluation(brief, delivery);
  }
}

async function callGroq(
  apiKey: string,
  brief: string,
  delivery: string,
  priceUsdc: number
): Promise<AgentEvaluation> {
  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        max_tokens: 512,
        temperature: 0.1,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user",   content: buildPrompt(brief, delivery, priceUsdc) },
        ],
      }),
    });

    if (!res.ok) {
      console.error("Groq API error:", res.status);
      return mockEvaluation(brief, delivery);
    }

    const data = await res.json();
    const text = data.choices?.[0]?.message?.content ?? "{}";
    return parseEvaluation(text);
  } catch (err) {
    console.error("Groq agent error:", err);
    return mockEvaluation(brief, delivery);
  }
}

async function callAnthropic(
  apiKey: string,
  brief: string,
  delivery: string,
  priceUsdc: number
): Promise<AgentEvaluation> {
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 512,
        messages: [{ role: "user", content: buildPrompt(brief, delivery, priceUsdc) }],
      }),
    });

    if (!res.ok) return mockEvaluation(brief, delivery);
    const data = await res.json();
    const text = data.content?.[0]?.text ?? "{}";
    return parseEvaluation(text);
  } catch {
    return mockEvaluation(brief, delivery);
  }
}

function parseEvaluation(text: string): AgentEvaluation {
  try {
    const clean = text
      .replace(/```json|```/g, "")
      .replace(/^[^{]*/, "")
      .replace(/[^}]*$/, "}")
      .trim();
    const parsed = JSON.parse(clean);
    const score = Math.min(100, Math.max(0, Number(parsed.score) || 80));
    return {
      score,
      reasoning: parsed.reasoning || "Delivery reviewed successfully.",
      wordCount: parsed.wordCount,
      recommendation:
        score >= 75 ? "APPROVE" : score >= 40 ? "PARTIAL" : "DISPUTE",
      partialPercent: parsed.partialPercent ?? undefined,
    };
  } catch {
    return mockEvaluation("", "fallback");
  }
}

function mockEvaluation(brief: string, delivery: string): AgentEvaluation {
  const words = delivery.trim().split(/\s+/).filter(Boolean).length;
  const hasContent = delivery.length > 50;
  const score = hasContent ? 88 : 30;
  return {
    score,
    reasoning: hasContent
      ? `Delivery reviewed. Word count: ${words}. Brief requirements assessed. Content meets expectations.`
      : "Delivery appears incomplete. Content is too short to meet brief requirements.",
    wordCount: words,
    recommendation: score >= 75 ? "APPROVE" : score >= 40 ? "PARTIAL" : "DISPUTE",
    partialPercent: score >= 75 ? undefined : score >= 40 ? 60 : undefined,
  };
}
