import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface QuizQuestionWithAnswer {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

async function generateQuizQuestions(skills: string): Promise<QuizQuestionWithAnswer[]> {
  const prompt = `You are a skills assessment expert for a professional freelance marketplace.
Generate exactly 6 multiple-choice questions to test practical skills in: ${skills}

Requirements:
- Test real-world knowledge: tools, best practices, problem-solving, common pitfalls
- Wrong answers must be plausible (not obviously wrong)
- Questions must be specific to the listed skills, not generic
- Vary difficulty: 2 easy, 3 medium, 1 hard

Return ONLY valid JSON, no markdown, no explanation outside the JSON:
{
  "questions": [
    {
      "id": "q1",
      "question": "Question text here?",
      "options": ["Option A text", "Option B text", "Option C text", "Option D text"],
      "correctIndex": 2,
      "explanation": "One sentence explaining why this answer is correct"
    }
  ]
}`;

  const nvidiaKey = process.env.NVIDIA_API_KEY;
  const groqKey = process.env.GROQ_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;

  let text: string | null = null;

  if (nvidiaKey) {
    try {
      const res = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${nvidiaKey}` },
        body: JSON.stringify({
          model: "meta/llama-3.3-70b-instruct",
          max_tokens: 1500,
          temperature: 0.3,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      if (res.ok) {
        const data = await res.json();
        text = data.choices?.[0]?.message?.content ?? null;
      }
    } catch {}
  }

  if (!text && groqKey) {
    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${groqKey}` },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          max_tokens: 1500,
          temperature: 0.3,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      if (res.ok) {
        const data = await res.json();
        text = data.choices?.[0]?.message?.content ?? null;
      }
    } catch {}
  }

  if (!text && anthropicKey) {
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": anthropicKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1500,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      if (res.ok) {
        const data = await res.json();
        text = data.content?.[0]?.text ?? null;
      }
    } catch {}
  }

  if (text) {
    try {
      const startIdx = text.indexOf("{");
      const endIdx = text.lastIndexOf("}");
      if (startIdx !== -1 && endIdx !== -1) {
        const parsed = JSON.parse(text.slice(startIdx, endIdx + 1));
        const qs = parsed.questions;
        if (Array.isArray(qs) && qs.length >= 3) {
          return qs.slice(0, 6).map((q: Record<string, unknown>, i: number) => ({
            id: `q${i + 1}`,
            question: String(q.question || ""),
            options: Array.isArray(q.options)
              ? q.options.slice(0, 4).map(String)
              : ["True", "False", "Not sure", "N/A"],
            correctIndex: typeof q.correctIndex === "number" ? Math.min(3, Math.max(0, q.correctIndex)) : 0,
            explanation: String(q.explanation || ""),
          }));
        }
      }
    } catch {}
  }

  return getFallbackQuestions(skills);
}

function getFallbackQuestions(skills: string): QuizQuestionWithAnswer[] {
  const skill = skills.split(",")[0]?.trim() || "freelance work";
  return [
    {
      id: "q1",
      question: `When starting a new ${skill} project, what should be established first?`,
      options: [
        "Start working immediately to show eagerness",
        "Clear scope, deliverables, and acceptance criteria",
        "Negotiate the highest possible rate",
        "Request full payment upfront",
      ],
      correctIndex: 1,
      explanation: "Clear scope prevents misalignment and protects both client and worker from scope creep disputes.",
    },
    {
      id: "q2",
      question: "A client requests changes that go significantly beyond the original brief. What is the professional response?",
      options: [
        "Do it for free to maintain the relationship",
        "Refuse and deliver only what was originally agreed",
        "Discuss the additional scope and adjust timeline or cost accordingly",
        "Ignore the request and submit original work",
      ],
      correctIndex: 2,
      explanation: "Addressing scope changes professionally preserves the relationship while respecting your time and expertise.",
    },
    {
      id: "q3",
      question: "What is the most effective way to ensure client satisfaction on a long project?",
      options: [
        "Complete everything before showing the client",
        "Provide progress updates and seek feedback at key milestones",
        "Only contact the client when you need more information",
        "Deliver early to exceed expectations",
      ],
      correctIndex: 1,
      explanation: "Regular check-ins catch misalignments early and build trust through transparency.",
    },
    {
      id: "q4",
      question: "How should you handle a situation where you realize you cannot meet the agreed deadline?",
      options: [
        "Submit incomplete work at the deadline",
        "Disappear and hope the client forgets",
        "Communicate proactively as soon as possible with a revised timeline",
        "Wait until the deadline passes, then apologize",
      ],
      correctIndex: 2,
      explanation: "Early, honest communication about delays is far better than surprise and builds professional credibility.",
    },
    {
      id: "q5",
      question: "What distinguishes a high-quality deliverable from a mediocre one?",
      options: [
        "It was completed faster than expected",
        "It fully addresses the brief with attention to detail and exceeds minimum requirements",
        "It is the longest or most complex version possible",
        "It uses the most advanced tools available",
      ],
      correctIndex: 1,
      explanation: "Quality is defined by how well the output meets the client's actual needs, not by length or complexity.",
    },
    {
      id: "q6",
      question: "A client's brief is ambiguous and open to interpretation. What is the best course of action?",
      options: [
        "Choose the interpretation that requires the least work",
        "Ask targeted clarifying questions before starting",
        "Deliver multiple versions to cover all interpretations",
        "Proceed with the most complex interpretation to demonstrate value",
      ],
      correctIndex: 1,
      explanation: "Clarifying ambiguities upfront prevents rework, misaligned deliveries, and disputes.",
    },
  ];
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { walletAddress, skills } = body;

    if (!walletAddress || !skills?.trim()) {
      return NextResponse.json({ error: "walletAddress and skills required" }, { status: 400 });
    }

    const { db } = await import("@/lib/db");

    const freelancer = await db.freelancer.findFirst({
      where: { walletAddress: walletAddress.toLowerCase() },
    });

    if (!freelancer) {
      return NextResponse.json(
        { error: "Profile not found. Save your profile first." },
        { status: 404 }
      );
    }

    if (freelancer.quizPassed) {
      return NextResponse.json({ alreadyPassed: true, score: freelancer.quizScore });
    }

    const fullQuestions = await generateQuizQuestions(skills);

    // Split: client gets questions only (no correct answers)
    const clientQuestions = fullQuestions.map(({ correctIndex: _c, explanation: _e, ...q }) => q);
    const storedAnswers = fullQuestions.map(q => ({
      correctIndex: q.correctIndex,
      explanation: q.explanation,
    }));

    const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000);
    const session = await db.quizSession.create({
      data: {
        freelancerId: freelancer.id,
        skills,
        questions: clientQuestions as object,
        answers: storedAnswers as object,
        expiresAt,
      },
    });

    return NextResponse.json({
      sessionId: session.id,
      questions: clientQuestions,
      totalQuestions: clientQuestions.length,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("POST /api/quiz/generate error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
