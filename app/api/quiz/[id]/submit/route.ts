import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { sessionId, questionId, selectedOption, timeSpent } = body;

    // Validate session
    const session = await prisma.quizSession.findUnique({
      where: { id: sessionId },
    });

    if (!session || session.quizId !== params.id) {
      return NextResponse.json({ error: "Invalid session" }, { status: 400 });
    }

    // Get actual question with correct answers
    const question = await prisma.question.findUnique({
      where: { id: questionId },
    });

    if (!question) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    const options = question.options as { id: string; text: string; isCorrect: boolean }[];
    const correctIds = options.filter((o) => o.isCorrect).map((o) => o.id);
    const selected = Array.isArray(selectedOption) ? selectedOption : [selectedOption];

    // Check correctness
    let isCorrect = false;
    if (question.type === "SHORT_ANSWER") {
      const correctAnswer = options[0]?.text || "";
      isCorrect =
        selected[0]?.toLowerCase().trim() === correctAnswer.toLowerCase().trim();
    } else if (question.type === "MULTIPLE_SELECT") {
      isCorrect =
        selected.length === correctIds.length &&
        selected.every((s: string) => correctIds.includes(s));
    } else {
      isCorrect = selected.length === 1 && correctIds.includes(selected[0]);
    }

    // Calculate score
    let pointsEarned = 0;
    if (isCorrect) {
      const timeBonus = Math.round(
        ((question.timeLimit - timeSpent) / question.timeLimit) * 500
      );
      pointsEarned = question.points + Math.max(0, timeBonus);
    }

    // Save answer
    const answer = await prisma.answer.create({
      data: {
        sessionId,
        questionId,
        selectedOption: selected,
        isCorrect,
        pointsEarned,
        timeSpent,
      },
    });

    // Update session score
    await prisma.quizSession.update({
      where: { id: sessionId },
      data: {
        score: { increment: pointsEarned },
        totalTime: { increment: timeSpent },
      },
    });

    return NextResponse.json({
      isCorrect,
      pointsEarned,
      correctAnswers: correctIds,
      explanation: question.explanation,
    });
  } catch (error) {
    console.error("Submit answer error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
