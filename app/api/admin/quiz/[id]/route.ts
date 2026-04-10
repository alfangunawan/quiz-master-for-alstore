import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const quiz = await prisma.quiz.findUnique({
      where: { id: params.id },
      include: {
        questions: { orderBy: { order: "asc" } },
        _count: { select: { sessions: true } },
      },
    });

    if (!quiz) {
      return NextResponse.json({ error: "Quiz tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ quiz });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    
    const quiz = await prisma.quiz.findUnique({ where: { id: params.id } });
    if (!quiz || quiz.createdById !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updated = await prisma.quiz.update({
      where: { id: params.id },
      data: {
        title: body.title,
        description: body.description,
        category: body.category,
        tags: body.tags,
        visibility: body.visibility,
        randomizeQ: body.randomizeQ,
        randomizeA: body.randomizeA,
        maxParticipants: body.maxParticipants,
        showLiveBoard: body.showLiveBoard,
        allowGuest: body.allowGuest,
      },
    });

    return NextResponse.json({ quiz: updated });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(
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

    await prisma.quiz.delete({ where: { id: params.id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
