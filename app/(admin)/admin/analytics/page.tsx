import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import AnalyticsClient from "./client";

export default async function AnalyticsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
    redirect("/dashboard");
  }

  const quizzes = await prisma.quiz.findMany({
    where: { createdById: user.id },
    include: {
      _count: { select: { sessions: true, questions: true } },
      sessions: {
        where: { completedAt: { not: null } },
        select: { accuracy: true, score: true, createdAt: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const quizAnalytics = quizzes.map((q) => {
    const scores = q.sessions.map((s) => s.accuracy);
    const avgScore =
      scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;

    return {
      id: q.id,
      title: q.title,
      category: q.category,
      participants: q._count.sessions,
      questions: q._count.questions,
      avgScore: Math.round(avgScore),
      status: q.status,
      createdAt: q.createdAt.toISOString(),
    };
  });

  // Calculate distribution for grade chart
  const allScores = quizzes.flatMap((q) =>
    q.sessions.map((s) => s.accuracy)
  );
  const distribution = {
    excellent: allScores.filter((s) => s >= 90).length,
    good: allScores.filter((s) => s >= 70 && s < 90).length,
    fair: allScores.filter((s) => s >= 50 && s < 70).length,
    tryAgain: allScores.filter((s) => s < 50).length,
  };

  // Daily participants (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const dailySessions = await prisma.quizSession.groupBy({
    by: ["createdAt"],
    where: {
      quiz: { createdById: user.id },
      createdAt: { gte: thirtyDaysAgo },
    },
    _count: true,
  });

  return (
    <AnalyticsClient
      quizAnalytics={quizAnalytics}
      distribution={distribution}
      totalParticipants={allScores.length}
    />
  );
}
