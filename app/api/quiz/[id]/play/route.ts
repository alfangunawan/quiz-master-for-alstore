import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const quiz = await prisma.quiz.findUnique({
      where: { id: params.id },
      include: {
        questions: {
          orderBy: { order: "asc" },
          select: {
            id: true,
            type: true,
            text: true,
            image: true,
            options: true,
            timeLimit: true,
            points: true,
            order: true,
          },
        },
      },
    });

    if (!quiz) {
      return NextResponse.json({ error: "Quiz tidak ditemukan" }, { status: 404 });
    }

    let questions = quiz.questions;

    // Randomize question order if enabled
    if (quiz.randomizeQ) {
      questions = [...questions].sort(() => Math.random() - 0.5);
    }

    // Randomize answer options if enabled
    if (quiz.randomizeA) {
      questions = questions.map((q) => {
        const opts = q.options as any[];
        return {
          ...q,
          options: [...opts].sort(() => Math.random() - 0.5),
        };
      });
    }

    // Remove isCorrect from options sent to client
    const sanitizedQuestions = questions.map((q) => ({
      ...q,
      options: (q.options as any[]).map((o: any) => ({
        id: o.id,
        text: o.text,
      })),
    }));

    // Create session
    const session = await auth();
    const quizSession = await prisma.quizSession.create({
      data: {
        quizId: quiz.id,
        userId: session?.user?.id || null,
        guestName: null,
      },
    });

    return NextResponse.json({
      sessionId: quizSession.id,
      quiz: {
        id: quiz.id,
        title: quiz.title,
        showLiveBoard: quiz.showLiveBoard,
      },
      questions: sanitizedQuestions,
    });
  } catch (error) {
    console.error("Play quiz error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
