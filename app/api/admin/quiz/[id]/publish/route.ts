import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const quiz = await prisma.quiz.findUnique({ where: { id: params.id } });
    if (!quiz || quiz.createdById !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const questionCount = await prisma.question.count({ where: { quizId: params.id } });
    if (questionCount === 0) {
      return NextResponse.json(
        { error: "Quiz harus memiliki minimal 1 soal" },
        { status: 400 }
      );
    }

    const updated = await prisma.quiz.update({
      where: { id: params.id },
      data: {
        status: "ACTIVE",
        publishedAt: new Date(),
      },
    });

    return NextResponse.json({ quiz: updated });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
