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
      return NextResponse.json({ error: "Quiz tidak ditemukan" }, { status: 404 });
    }

    const allowedStatuses = ["ACTIVE", "SCHEDULED", "WAITING"];
    if (!allowedStatuses.includes(quiz.status)) {
      return NextResponse.json(
        { error: "Quiz belum aktif atau sudah selesai" },
        { status: 400 }
      );
    }

    if (quiz.maxParticipants && quiz._count.sessions >= quiz.maxParticipants) {
      return NextResponse.json({ error: "Kuota peserta sudah penuh" }, { status: 400 });
    }

    // Check expiry for OPEN mode
    if (quiz.mode === "OPEN" && quiz.expiresAt && new Date() > quiz.expiresAt) {
      return NextResponse.json({ error: "Waktu quiz sudah habis" }, { status: 400 });
    }

    return NextResponse.json({
      quiz: {
        id: quiz.id,
        title: quiz.title,
        description: quiz.description,
        category: quiz.category,
        code: quiz.code,
        mode: quiz.mode,
        status: quiz.status,
        questionsCount: quiz._count.questions,
        participantsCount: quiz._count.sessions,
        allowGuest: quiz.allowGuest,
        scheduledAt: quiz.scheduledAt?.toISOString() || null,
        createdBy: quiz.createdBy.name,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
