import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

// SCHEDULED → WAITING: opens the waiting room
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

    if (quiz.status !== "SCHEDULED") {
      return NextResponse.json(
        { error: "Quiz harus berstatus SCHEDULED untuk membuka ruang tunggu" },
        { status: 400 }
      );
    }

    // Create waiting room if not exists
    await prisma.waitingRoom.upsert({
      where: { quizId: params.id },
      update: {},
      create: { quizId: params.id },
    });

    const updated = await prisma.quiz.update({
      where: { id: params.id },
      data: { status: "WAITING" },
    });

    return NextResponse.json({ quiz: updated });
  } catch (error) {
    console.error("Open room error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
