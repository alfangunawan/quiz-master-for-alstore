import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { generateQuizCode } from "@/lib/utils";
import { z } from "zod";

const quizSchema = z.object({
  title: z.string().min(1, "Judul wajib diisi"),
  description: z.string().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  mode: z.enum(["SCHEDULED", "OPEN"]).optional(),
  visibility: z.enum(["PUBLIC", "PRIVATE", "DRAFT"]).optional(),
  randomizeQ: z.boolean().optional(),
  randomizeA: z.boolean().optional(),
  maxParticipants: z.number().nullable().optional(),
  showLiveBoard: z.boolean().optional(),
  allowGuest: z.boolean().optional(),
  scheduledAt: z.string().nullable().optional(),
  expiresAt: z.string().nullable().optional(),
  questions: z
    .array(
      z.object({
        type: z.enum(["MULTIPLE_CHOICE", "TRUE_FALSE", "SHORT_ANSWER", "MULTIPLE_SELECT"]),
        text: z.string().min(1),
        image: z.string().nullable().optional(),
        options: z.any(),
        explanation: z.string().nullable().optional(),
        timeLimit: z.number().default(30),
        points: z.number().default(1000),
        order: z.number(),
      })
    )
    .min(1, "Minimal 1 soal"),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const validated = quizSchema.parse(body);

    let code = generateQuizCode();
    let codeExists = await prisma.quiz.findUnique({ where: { code } });
    while (codeExists) {
      code = generateQuizCode();
      codeExists = await prisma.quiz.findUnique({ where: { code } });
    }

    const quiz = await prisma.quiz.create({
      data: {
        title: validated.title,
        description: validated.description,
        category: validated.category,
        tags: validated.tags || [],
        code,
        mode: validated.mode || "OPEN",
        visibility: validated.visibility || "PRIVATE",
        randomizeQ: validated.randomizeQ || false,
        randomizeA: validated.randomizeA || false,
        maxParticipants: validated.maxParticipants,
        showLiveBoard: validated.showLiveBoard ?? true,
        allowGuest: validated.allowGuest || false,
        scheduledAt: validated.scheduledAt ? new Date(validated.scheduledAt) : null,
        expiresAt: validated.expiresAt ? new Date(validated.expiresAt) : null,
        createdById: user.id,
        questions: {
          create: validated.questions.map((q) => ({
            type: q.type,
            text: q.text,
            image: q.image,
            options: q.options,
            explanation: q.explanation,
            timeLimit: q.timeLimit,
            points: q.points,
            order: q.order,
          })),
        },
      },
      include: { questions: true },
    });

    return NextResponse.json({ quiz }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    console.error("Create quiz error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const quizzes = await prisma.quiz.findMany({
      where: { createdById: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { sessions: true, questions: true } },
        waitingRoom: { include: { _count: { select: { participants: true } } } },
      },
    });

    return NextResponse.json({ quizzes });
  } catch (error) {
    console.error("Get quizzes error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}
