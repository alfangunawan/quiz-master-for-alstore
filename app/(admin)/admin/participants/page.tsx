import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import ParticipantsClient from "./client";

export default async function ParticipantsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
    redirect("/dashboard");
  }

  const participants = await prisma.quizSession.findMany({
    where: { quiz: { createdById: user.id } },
    include: {
      user: { select: { name: true, email: true, image: true } },
      quiz: { select: { title: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <ParticipantsClient
      participants={participants.map((p) => ({
        id: p.id,
        name: p.user?.name || p.guestName || "Guest",
        email: p.user?.email || "-",
        quizTitle: p.quiz.title,
        score: p.score,
        accuracy: p.accuracy,
        completedAt: p.completedAt?.toISOString() || null,
        createdAt: p.createdAt.toISOString(),
      }))}
    />
  );
}
