import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(req.url);
    const questionId = searchParams.get("questionId");
    const sessionId = searchParams.get("sessionId");

    // Get all sessions for this quiz sorted by score
    const sessions = await prisma.quizSession.findMany({
      where: { quizId: params.id },
      include: {
        user: { select: { name: true } },
        answers: questionId
          ? { where: { questionId }, select: { pointsEarned: true } }
          : false,
      },
      orderBy: { score: "desc" },
    });

    const leaderboard = sessions.map((s, idx) => ({
      rank: idx + 1,
      sessionId: s.id,
      name: s.user?.name || s.guestName || "Tamu",
      score: s.score,
      delta: questionId
        ? ((s as any).answers?.[0]?.pointsEarned ?? 0)
        : 0,
      isCurrentUser: s.id === sessionId,
    }));

    // Current user rank (even if outside top 10)
    const currentUserEntry = leaderboard.find((e) => e.isCurrentUser);
    const top10 = leaderboard.slice(0, 10);

    // If current user is outside top 10, append them
    if (currentUserEntry && currentUserEntry.rank > 10) {
      top10.push(currentUserEntry);
    }

    return NextResponse.json({
      leaderboard: top10,
      currentUserRank: currentUserEntry?.rank || null,
      totalParticipants: sessions.length,
    });
  } catch (error) {
    console.error("Leaderboard error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
