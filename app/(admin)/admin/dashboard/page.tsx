import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import AdminDashboardClient from "./client";

export default async function AdminDashboard() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
    redirect("/dashboard");
  }

  const totalQuizzes = await prisma.quiz.count({
    where: { createdById: user.id },
  });

  const activeQuizzes = await prisma.quiz.count({
    where: { createdById: user.id, status: "ACTIVE" },
  });

  const totalParticipants = await prisma.quizSession.count({
    where: { quiz: { createdById: user.id } },
  });

  const avgAccuracy = await prisma.quizSession.aggregate({
    where: { quiz: { createdById: user.id }, completedAt: { not: null } },
    _avg: { accuracy: true },
  });

  const recentQuizzes = await prisma.quiz.findMany({
    where: { createdById: user.id },
    orderBy: { createdAt: "desc" },
    take: 10,
    include: {
      _count: { select: { sessions: true, questions: true } },
    },
  });

  return (
    <AdminDashboardClient
      stats={{
        totalQuizzes,
        activeQuizzes,
        totalParticipants,
        avgScore: Math.round(avgAccuracy._avg.accuracy || 0),
      }}
      recentQuizzes={recentQuizzes.map((q) => ({
        id: q.id,
        title: q.title,
        status: q.status,
        code: q.code,
        category: q.category,
        questionsCount: q._count.questions,
        participantsCount: q._count.sessions,
        createdAt: q.createdAt.toISOString(),
      }))}
    />
  );
}
