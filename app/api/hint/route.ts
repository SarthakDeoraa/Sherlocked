import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getToken } from "next-auth/jwt";

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req });
    if (!token?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: token.email },
      include: { team: true },
    });
    if (!user?.teamId) {
      return NextResponse.json({ error: "User not in team" }, { status: 400 });
    }

    const teamProgress = await prisma.teamProgress.findUnique({
      where: { teamId: user.teamId },
    });
    if (!teamProgress) {
      return NextResponse.json({ error: "Team progress not found" }, { status: 404 });
    }

    const question = await prisma.question.findUnique({
      where: { level: teamProgress.currentLevel },
      include: {
        hints: {
          where: { isEnabled: true },
          orderBy: { id: "asc" },
        },
      },
    });
    if (!question) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    return NextResponse.json({
      questionId: question.id,
      hints: question.hints.map(hint => ({
        id: hint.id,
        content: hint.content,
      })),
      totalHints: question.hints.length,
    });
  } catch (error) {
    console.error("Hint fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 