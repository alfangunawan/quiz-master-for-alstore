import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import EditQuizClient from "./client";

export default async function EditQuizPage({
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
    },
  });

  if (!quiz || quiz.createdById !== session.user.id) {
    redirect("/admin/quiz");
  }

  return (
    <EditQuizClient
      quiz={{
        id: quiz.id,
        title: quiz.title,
        description: quiz.description || "",
        category: quiz.category || "Umum",
        code: quiz.code,
        status: quiz.status,
        mode: quiz.mode,
        scheduledAt: quiz.scheduledAt?.toISOString() || null,
        expiresAt: quiz.expiresAt?.toISOString() || null,
        visibility: quiz.visibility,
        randomizeQ: quiz.randomizeQ,
        randomizeA: quiz.randomizeA,
        maxParticipants: quiz.maxParticipants,
        showLiveBoard: quiz.showLiveBoard,
        allowGuest: quiz.allowGuest,
      }}
      questions={quiz.questions.map((q) => ({
        id: q.id,
        type: q.type,
        text: q.text,
        options: q.options as any,
        explanation: q.explanation || "",
        timeLimit: q.timeLimit,
        points: q.points,
        order: q.order,
      }))}
    />
  );
}
