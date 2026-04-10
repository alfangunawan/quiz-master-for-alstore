import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import QuizListClient from "./client";

export default async function QuizListPage() {
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
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { sessions: true, questions: true } },
      waitingRoom: { select: { _count: { select: { participants: true } } } },
    },
  });

  return (
    <QuizListClient
      quizzes={quizzes.map((q) => ({
        id: q.id,
        title: q.title,
        description: q.description,
        status: q.status,
        mode: q.mode,
        scheduledAt: q.scheduledAt?.toISOString() || null,
        code: q.code,
        category: q.category,
        visibility: q.visibility,
        questionsCount: q._count.questions,
        participantsCount: q._count.sessions,
        waitingCount: q.waitingRoom?._count.participants ?? 0,
        createdAt: q.createdAt.toISOString(),
      }))}
    />
  );
}
