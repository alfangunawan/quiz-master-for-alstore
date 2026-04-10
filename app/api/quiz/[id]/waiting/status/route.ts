import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(req.url);
    const participantId = searchParams.get("participantId");

    const quiz = await prisma.quiz.findUnique({
      where: { id: params.id },
      include: {
        waitingRoom: {
          include: {
            participants: {
              where: { kicked: false },
              orderBy: { joinedAt: "asc" },
            },
          },
        },
      },
    });

    if (!quiz) {
      return NextResponse.json({ error: "Quiz tidak ditemukan" }, { status: 404 });
    }

    // Check if this participant was kicked
    if (participantId) {
      const participant = await prisma.waitingParticipant.findUnique({
        where: { id: participantId },
      });
      if (participant?.kicked) {
        return NextResponse.json({ status: "KICKED" });
      }
    }

    const participants = quiz.waitingRoom?.participants.map((p) => ({
      id: p.id,
      name: p.guestName || "Tamu",
      joinedAt: p.joinedAt.toISOString(),
    })) || [];

    return NextResponse.json({
      status: quiz.status,
      quizId: quiz.id,
      participantCount: participants.length,
      participants,
      scheduledAt: quiz.scheduledAt?.toISOString() || null,
    });
  } catch (error) {
    console.error("Waiting status error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
