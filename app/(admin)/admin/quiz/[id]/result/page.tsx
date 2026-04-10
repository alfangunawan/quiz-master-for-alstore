import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import ResultClient from "./client";

export default async function QuizResultPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const quiz = await prisma.quiz.findUnique({
    where: { id: params.id },
    include: {
      questions: { orderBy: { order: "asc" } },
      sessions: {
        include: {
          user: { select: { name: true, email: true } },
          answers: true,
        },
        orderBy: { score: "desc" },
      },
    },
  });

  if (!quiz || quiz.createdById !== session.user.id) {
    redirect("/admin/quiz");
  }

  const completedSessions = quiz.sessions.filter((s) => s.completedAt);
  const avgScore =
    completedSessions.length > 0
      ? completedSessions.reduce((a, b) => a + b.accuracy, 0) /
        completedSessions.length
      : 0;
  const avgTime =
    completedSessions.length > 0
      ? completedSessions.reduce((a, b) => a + b.totalTime, 0) /
        completedSessions.length
      : 0;

  // Per-question accuracy
  const questionStats = quiz.questions.map((q) => {
    const answers = quiz.sessions.flatMap((s) =>
      s.answers.filter((a) => a.questionId === q.id)
    );
    const correct = answers.filter((a) => a.isCorrect).length;
    const total = answers.length;
    return {
      id: q.id,
      text: q.text,
      type: q.type,
      accuracy: total > 0 ? Math.round((correct / total) * 100) : 0,
      totalAnswers: total,
    };
  });

  return (
    <ResultClient
      quiz={{
        id: quiz.id,
        title: quiz.title,
        code: quiz.code,
        status: quiz.status,
      }}
      stats={{
        totalParticipants: quiz.sessions.length,
        completedParticipants: completedSessions.length,
        avgScore: Math.round(avgScore),
        avgTime: Math.round(avgTime),
        highestScore: completedSessions[0]?.score || 0,
        lowestScore:
          completedSessions[completedSessions.length - 1]?.score || 0,
      }}
      leaderboard={quiz.sessions
        .filter((s) => s.completedAt)
        .map((s, i) => ({
          rank: i + 1,
          name: s.user?.name || s.guestName || "Guest",
          email: s.user?.email || "-",
          score: s.score,
          accuracy: Math.round(s.accuracy),
          totalTime: s.totalTime,
        }))}
      questionStats={questionStats}
    />
  );
}
