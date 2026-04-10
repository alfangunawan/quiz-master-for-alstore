import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { sessionId } = body;

    const session = await prisma.quizSession.findUnique({
      where: { id: sessionId },
      include: {
        answers: true,
        quiz: { include: { questions: true } },
      },
    });

    if (!session || session.quizId !== params.id) {
      return NextResponse.json({ error: "Invalid session" }, { status: 400 });
    }

    const totalQuestions = session.quiz.questions.length;
    const correctAnswers = session.answers.filter((a) => a.isCorrect).length;
    const accuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;

    // Calculate rank
    const betterSessions = await prisma.quizSession.count({
      where: {
        quizId: params.id,
        completedAt: { not: null },
        score: { gt: session.score },
      },
    });
    const rank = betterSessions + 1;

    // Update session
    const updated = await prisma.quizSession.update({
      where: { id: sessionId },
      data: {
        completedAt: new Date(),
        accuracy,
        rank,
      },
    });

    // Get leaderboard
    const leaderboard = await prisma.quizSession.findMany({
      where: {
        quizId: params.id,
        completedAt: { not: null },
      },
      orderBy: { score: "desc" },
      take: 10,
      include: {
        user: { select: { name: true, image: true } },
      },
    });

    return NextResponse.json({
      result: {
        score: updated.score,
        totalTime: updated.totalTime,
        accuracy,
        rank,
        totalQuestions,
        correctAnswers,
        wrongAnswers: totalQuestions - correctAnswers,
      },
      leaderboard: leaderboard.map((s, i) => ({
        rank: i + 1,
        name: s.user?.name || s.guestName || "Guest",
        image: s.user?.image,
        score: s.score,
        accuracy: s.accuracy,
      })),
    });
  } catch (error) {
    console.error("Finish quiz error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
