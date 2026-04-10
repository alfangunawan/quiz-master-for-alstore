import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

// WAITING → ACTIVE: starts quiz for all waiting participants
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

    if (quiz.status !== "WAITING" && quiz.status !== "SCHEDULED") {
      return NextResponse.json(
        { error: "Quiz harus berstatus WAITING atau SCHEDULED untuk dimulai" },
        { status: 400 }
      );
    }

    const updated = await prisma.quiz.update({
      where: { id: params.id },
      data: {
        status: "ACTIVE",
        publishedAt: quiz.publishedAt || new Date(),
      },
    });

    return NextResponse.json({ quiz: updated });
  } catch (error) {
    console.error("Start quiz error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
