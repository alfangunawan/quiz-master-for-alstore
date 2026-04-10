import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import HistoryClient from "./client";

export default async function HistoryPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const sessions = await prisma.quizSession.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      quiz: { select: { title: true, category: true, code: true } },
    },
  });

  return (
    <HistoryClient
      sessions={sessions.map((s) => ({
        id: s.id,
        quizTitle: s.quiz.title,
        quizCategory: s.quiz.category,
        quizCode: s.quiz.code,
        score: s.score,
        accuracy: s.accuracy,
        rank: s.rank,
        totalTime: s.totalTime,
        completedAt: s.completedAt?.toISOString() || null,
        createdAt: s.createdAt.toISOString(),
      }))}
    />
  );
}
