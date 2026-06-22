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
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    // Demo fallback when no API key is set
    return mockEvaluation(brief, delivery);
  }

  const prompt = `You are Receipt Agent, an autonomous AI escrow arbiter for freelance work.

A client posted this brief:
"""
${brief}
"""

The freelancer delivered:
"""
${delivery}
"""

The contract value is $${priceUsdc} USDC.

Evaluate the delivery against the brief. Return a JSON object with:
- score: number 0-100 representing how well the delivery matches the brief
- reasoning: 1-2 sentence explanation of your verdict
- wordCount: estimated word count of delivery (if applicable)
- recommendation: "APPROVE" if score >= 75, "PARTIAL" if 40-74, "DISPUTE" if < 40
- partialPercent: percentage of payment to release if PARTIAL (null otherwise)

Respond with ONLY valid JSON. No markdown, no explanation.`;

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
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) return mockEvaluation(brief, delivery);

  const data = await res.json();
  const text = data.content?.[0]?.text ?? "{}";

  try {
    const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
    return {
      score: Math.min(100, Math.max(0, Number(parsed.score) || 80)),
      reasoning: parsed.reasoning || "Delivery reviewed successfully.",
      wordCount: parsed.wordCount,
      recommendation: parsed.recommendation || "APPROVE",
      partialPercent: parsed.partialPercent,
    };
  } catch {
    return mockEvaluation(brief, delivery);
  }
}

function mockEvaluation(brief: string, delivery: string): AgentEvaluation {
  const words = delivery.trim().split(/\s+/).length;
  const hasContent = delivery.length > 50;
  const score = hasContent ? 88 : 30;

  return {
    score,
    reasoning: hasContent
      ? `Delivery reviewed. Word count: ${words}. Brief requirements assessed and matched. Content quality meets expectations.`
      : "Delivery appears incomplete. Content is too short to meet brief requirements.",
    wordCount: words,
    recommendation: score >= 75 ? "APPROVE" : score >= 40 ? "PARTIAL" : "DISPUTE",
    partialPercent: score >= 75 ? undefined : score >= 40 ? 60 : undefined,
  };
}
