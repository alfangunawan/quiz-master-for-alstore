import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { guestName } = body;

    const quiz = await prisma.quiz.findUnique({
      where: { id: params.id },
      include: { waitingRoom: true },
    });

    if (!quiz) {
      return NextResponse.json({ error: "Quiz tidak ditemukan" }, { status: 404 });
    }

    if (quiz.status !== "SCHEDULED" && quiz.status !== "WAITING") {
      return NextResponse.json(
        { error: "Ruang tunggu tidak tersedia" },
        { status: 400 }
      );
    }

    const session = await auth();
    const userId = session?.user?.id || null;

    // Get or create waiting room
    let waitingRoom = quiz.waitingRoom;
    if (!waitingRoom) {
      waitingRoom = await prisma.waitingRoom.create({
        data: { quizId: quiz.id },
      });
    }

    // Check if already joined (by userId or same session)
    if (userId) {
      const existing = await prisma.waitingParticipant.findFirst({
        where: { waitingRoomId: waitingRoom.id, userId, kicked: false },
      });
      if (existing) {
        return NextResponse.json({ participantId: existing.id });
      }
    }

    const participant = await prisma.waitingParticipant.create({
      data: {
        waitingRoomId: waitingRoom.id,
        userId,
        guestName: userId ? null : (guestName || "Tamu"),
      },
    });

    return NextResponse.json({ participantId: participant.id });
  } catch (error) {
    console.error("Join waiting room error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
