import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getToken } from "next-auth/jwt";

export async function GET(req: NextRequest) {
  try {
    // Authenticate user
    const token = await getToken({ req });
    if (!token || !token.email) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    // Find user and their team
    const user = await prisma.user.findUnique({
      where: { email: token.email as string },
      include: { team: true },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }
    if (!user.teamId) {
      return NextResponse.json({ error: "User is not in a team." }, { status: 400 });
    }

    // Get team progress
    const teamProgress = await prisma.teamProgress.findUnique({
      where: { teamId: user.teamId },
    });
    if (!teamProgress) {
      return NextResponse.json({ error: "Team progress not found." }, { status: 404 });
    }

    // Get the current question for the team's level
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
      return NextResponse.json({ error: "No question found for current level." }, { status: 404 });
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
    console.error("Error fetching hints:", error);
    return NextResponse.json({ error: "Failed to fetch hints." }, { status: 500 });
  }
} 