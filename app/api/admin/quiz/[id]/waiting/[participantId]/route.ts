import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

// Kick a participant from the waiting room
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; participantId: string } }
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

    await prisma.waitingParticipant.update({
      where: { id: params.participantId },
      data: { kicked: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Kick participant error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
