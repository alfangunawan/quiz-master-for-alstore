import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import UserDashboardClient from "./client";

export default async function UserDashboard() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      sessions: {
        include: { quiz: true },
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
  });

  if (!user) redirect("/login");

  // If user is admin, redirect to admin dashboard
  if (user.role === "ADMIN" || user.role === "SUPER_ADMIN") {
    redirect("/admin/dashboard");
  }

  const totalQuizzes = await prisma.quizSession.count({
    where: { userId: user.id },
  });

  const completedQuizzes = await prisma.quizSession.count({
    where: { userId: user.id, completedAt: { not: null } },
  });

  const avgScore = await prisma.quizSession.aggregate({
    where: { userId: user.id, completedAt: { not: null } },
    _avg: { accuracy: true },
  });

  const bestRank = await prisma.quizSession.aggregate({
    where: { userId: user.id, rank: { not: null } },
    _min: { rank: true },
  });

  return (
    <UserDashboardClient
      user={{
        name: user.name,
        email: user.email,
        image: user.image,
      }}
      stats={{
        totalQuizzes,
        completedQuizzes,
        avgScore: Math.round(avgScore._avg.accuracy || 0),
        bestRank: bestRank._min.rank || 0,
      }}
      recentSessions={user.sessions.map((s) => ({
        id: s.id,
        quizTitle: s.quiz.title,
        score: s.score,
        accuracy: s.accuracy,
        completedAt: s.completedAt?.toISOString() || null,
        createdAt: s.createdAt.toISOString(),
      }))}
    />
  );
}
