import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, answers }: { sessionId: string; answers: number[] } = body;

    if (!sessionId || !Array.isArray(answers)) {
      return NextResponse.json({ error: "sessionId and answers required" }, { status: 400 });
    }

    const { db } = await import("@/lib/db");

    const session = await db.quizSession.findUnique({
      where: { id: sessionId },
      include: { freelancer: true },
    });

    if (!session) {
      return NextResponse.json({ error: "Session not found or already used." }, { status: 404 });
    }

    if (new Date() > session.expiresAt) {
      return NextResponse.json({ error: "Quiz session expired. Please start a new quiz." }, { status: 410 });
    }

    const storedAnswers = session.answers as Array<{ correctIndex: number; explanation: string }>;

    let correct = 0;
    const results = storedAnswers.map((sa, i) => {
      const selected = typeof answers[i] === "number" ? answers[i] : -1;
      const isCorrect = selected === sa.correctIndex;
      if (isCorrect) correct++;
      return {
        correctIndex: sa.correctIndex,
        selectedIndex: selected,
        explanation: sa.explanation,
        isCorrect,
      };
    });

    const score = Math.round((correct / storedAnswers.length) * 100);
    const passed = score >= 70;

    if (passed) {
      await db.freelancer.update({
        where: { id: session.freelancerId },
        data: {
          quizPassed: true,
          quizScore: score,
          quizPassedAt: new Date(),
        },
      });
    }

    // Delete session so it can't be reused
    await db.quizSession.delete({ where: { id: sessionId } }).catch(() => {});

    return NextResponse.json({
      score,
      passed,
      correct,
      total: storedAnswers.length,
      results,
      freelancerName: session.freelancer.name,
      message: passed
        ? `You scored ${score}%. You're Qualified! Your profile now shows a Qualified badge.`
        : `You scored ${score}%. You need 70% to qualify. Review the explanations and try again in 24 hours.`,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("POST /api/quiz/submit error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
