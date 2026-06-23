"use server";

export interface AgentEvaluation {
  score: number;
  reasoning: string;
  wordCount?: number;
  recommendation: "APPROVE" | "DISPUTE" | "PARTIAL";
  partialPercent?: number;
  model: string;
}

export async function evaluateDelivery(
  brief: string,
  delivery: string,
  priceUsdc: number
): Promise<AgentEvaluation> {
  const nvidiaKey = process.env.NVIDIA_API_KEY;
  const groqKey   = process.env.GROQ_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;

  if (nvidiaKey) {
    const result = await callNvidia(nvidiaKey, brief, delivery, priceUsdc);
    if (result) return result;
  }
  if (groqKey) {
    const result = await callGroq(groqKey, brief, delivery, priceUsdc);
    if (result) return result;
  }
  if (anthropicKey) {
    const result = await callAnthropic(anthropicKey, brief, delivery, priceUsdc);
    if (result) return result;
  }

  // Real evaluation without external API — analyze the delivery directly
  return localEvaluation(brief, delivery);
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

Contract value: ${priceUsdc}

Return a JSON object:
{
  "score": <0-100, how well delivery matches brief>,
  "reasoning": "<2-3 sentence detailed verdict explaining what was delivered and how it matches or misses the brief>",
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
): Promise<AgentEvaluation | null> {
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
      console.error("NVIDIA API error:", res.status);
      return null;
    }

    const data = await res.json();
    const text = data.choices?.[0]?.message?.content ?? "{}";
    const result = parseEvaluation(text);
    return { ...result, model: "nvidia/llama-3.3-70b-instruct" };
  } catch (err) {
    console.error("NVIDIA agent error:", err);
    return null;
  }
}

async function callGroq(
  apiKey: string,
  brief: string,
  delivery: string,
  priceUsdc: number
): Promise<AgentEvaluation | null> {
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
      return null;
    }

    const data = await res.json();
    const text = data.choices?.[0]?.message?.content ?? "{}";
    const result = parseEvaluation(text);
    return { ...result, model: "groq/llama-3.3-70b-versatile" };
  } catch (err) {
    console.error("Groq agent error:", err);
    return null;
  }
}

async function callAnthropic(
  apiKey: string,
  brief: string,
  delivery: string,
  priceUsdc: number
): Promise<AgentEvaluation | null> {
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
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: buildPrompt(brief, delivery, priceUsdc) }],
      }),
    });

    if (!res.ok) return null;
    const data = await res.json();
    const text = data.content?.[0]?.text ?? "{}";
    const result = parseEvaluation(text);
    return { ...result, model: "claude-sonnet-4-6" };
  } catch {
    return null;
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
    const score = Math.min(100, Math.max(0, Number(parsed.score) || 50));
    return {
      score,
      reasoning: parsed.reasoning || "Delivery reviewed.",
      wordCount: parsed.wordCount,
      recommendation:
        score >= 75 ? "APPROVE" : score >= 40 ? "PARTIAL" : "DISPUTE",
      partialPercent: parsed.partialPercent ?? undefined,
      model: "unknown",
    };
  } catch {
    return localEvaluation("", "");
  }
}

// Smart local evaluation when no API keys work
function localEvaluation(brief: string, delivery: string): AgentEvaluation {
  const words = delivery.trim().split(/\s+/).filter(Boolean).length;
  const briefWords = brief.trim().split(/\s+/).filter(Boolean).length;
  const briefKeywords = brief.toLowerCase().split(/\s+/).filter(w => w.length > 3);
  const deliveryLower = delivery.toLowerCase();
  const keywordMatches = briefKeywords.filter(k => deliveryLower.includes(k)).length;
  const keywordRatio = briefKeywords.length > 0 ? keywordMatches / briefKeywords.length : 0;

  let score = 40;
  if (words >= 100) score += 15;
  if (words >= 300) score += 10;
  if (words >= 500) score += 5;
  if (keywordRatio >= 0.3) score += 10;
  if (keywordRatio >= 0.5) score += 10;
  if (delivery.length > 200) score += 5;
  score = Math.min(95, Math.max(10, score));

  const reasoning = words < 20
    ? `Delivery is only ${words} words. The brief requested substantially more content. Insufficient to evaluate.`
    : words < 100
    ? `Delivery contains ${words} words with ${Math.round(keywordRatio * 100)}% keyword alignment to the brief. Content is present but may be insufficient for the scope requested.`
    : `Delivery contains ${words} words with ${Math.round(keywordRatio * 100)}% keyword alignment to the brief. Content scope appears adequate for the contract requirements.`;

  return {
    score,
    reasoning,
    wordCount: words,
    recommendation: score >= 75 ? "APPROVE" : score >= 40 ? "PARTIAL" : "DISPUTE",
    partialPercent: score >= 75 ? undefined : score >= 40 ? Math.round(score) : undefined,
    model: "receipt-local-eval",
  };
}
