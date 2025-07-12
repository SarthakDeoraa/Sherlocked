import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
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