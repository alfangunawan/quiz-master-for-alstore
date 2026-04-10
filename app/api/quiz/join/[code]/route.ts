import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const quiz = await prisma.quiz.findUnique({
      where: { code: params.code.toUpperCase() },
      include: {
        _count: { select: { questions: true, sessions: true } },
        createdBy: { select: { name: true } },
      },
    });

    if (!quiz) {
      return NextResponse.json(
        { error: "Quiz tidak ditemukan" },
        { status: 404 }
      );
    }

    if (quiz.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Quiz belum aktif atau sudah selesai" },
        { status: 400 }
      );
    }

    if (
      quiz.maxParticipants &&
      quiz._count.sessions >= quiz.maxParticipants
    ) {
      return NextResponse.json(
        { error: "Kuota peserta sudah penuh" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      quiz: {
        id: quiz.id,
        title: quiz.title,
        description: quiz.description,
        thumbnail: quiz.thumbnail,
        category: quiz.category,
        code: quiz.code,
        questionsCount: quiz._count.questions,
        participantsCount: quiz._count.sessions,
        allowGuest: quiz.allowGuest,
        createdBy: quiz.createdBy.name,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
