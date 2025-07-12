import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { answerSchema } from "@/lib/validations/answer";
import { handleAnswer } from "@/lib/websocket-server";

export async function POST(req: NextRequest) {
  try {
    const startTime = Date.now();
    
    const body = await req.json();
    const parseResult = answerSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.errors[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }
    const answer = parseResult.data;

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { team: true },
    });
    if (!user?.teamId) {
      return NextResponse.json({ error: "User not in a team." }, { status: 400 });
    }

    const teamProgress = await prisma.teamProgress.findUnique({
      where: { teamId: user.teamId },
    });
    if (!teamProgress) {
      return NextResponse.json({ error: "Team progress not found." }, { status: 404 });
    }

    // Rate limiting
    const now = new Date();
    const timeSinceLastActivity = now.getTime() - teamProgress.lastActivityAt.getTime();
    const rateLimitMs = 5000;

    if (timeSinceLastActivity < rateLimitMs) {
      const remainingTime = Math.ceil((rateLimitMs - timeSinceLastActivity) / 1000);
      return NextResponse.json(
        { error: `Rate limit exceeded. Please wait ${remainingTime} second(s).` },
        { status: 429 }
      );
    }

    const question = await prisma.question.findUnique({
      where: { level: teamProgress.currentLevel },
    });
    if (!question) {
      return NextResponse.json({ error: "No question found for current level." }, { status: 404 });
    }

    if (answer.answer !== question.correctAnswer) {
      await prisma.teamProgress.update({
        where: { teamId: user.teamId },
        data: { lastActivityAt: now },
      });

      const responseTime = Date.now() - startTime;
      await handleAnswer(user.teamId, false, responseTime);

      return NextResponse.json(
        { correct: false, message: "Incorrect answer." },
        { status: 200 }
      );
    }

    // Check if this is the final level and has already been completed
    const nextQuestion = await prisma.question.findUnique({
      where: { level: teamProgress.currentLevel + 1 },
    });

    const updateData: {
      totalScore: number;
      lastActivityAt: Date;
      lastAnswerAt: Date;
      currentLevel?: number;
    } = {
      totalScore: teamProgress.totalScore + question.points,
      lastActivityAt: now,
      lastAnswerAt: now,
    };

    if (nextQuestion) {
      updateData.currentLevel = teamProgress.currentLevel + 1;
    }

    const updatedProgress = await prisma.teamProgress.update({
      where: { teamId: user.teamId },
      data: updateData,
    });

    const responseTime = Date.now() - startTime;
    await handleAnswer(user.teamId, true, responseTime);

    return NextResponse.json(
      {
        correct: true,
        message: nextQuestion
          ? "Correct! Proceed to the next level."
          : "🎉 Congratulations! You have completed all levels and won the hunt! 🎉",
        nextLevel: nextQuestion ? updatedProgress.currentLevel : null,
        totalScore: updatedProgress.totalScore,
        completed: !nextQuestion,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in play route:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { team: true },
    });
    if (!user?.teamId) {
      return NextResponse.json({ error: "User not in a team." }, { status: 400 });
    }

    const teamProgress = await prisma.teamProgress.findUnique({
      where: { teamId: user.teamId },
    });
    if (!teamProgress) {
      return NextResponse.json({ error: "Team progress not found." }, { status: 404 });
    }

    const question = await prisma.question.findUnique({
      where: { level: teamProgress.currentLevel },
    });
    if (!question) {
      return NextResponse.json({ error: "No question found for current level." }, { status: 404 });
    }

    // Check if this is the final level and has been completed
    // Only mark as completed if there's no next question AND the current level has been answered
    const nextQuestion = await prisma.question.findUnique({
      where: { level: teamProgress.currentLevel + 1 },
    });

    // Check if the current level has been answered (for final level completion)
    const currentLevelAnswered = teamProgress.lastAnswerAt && 
      teamProgress.currentLevel === question.level;

    const isCompleted = !nextQuestion && currentLevelAnswered;

    return NextResponse.json({
      level: question.level,
      title: question.title,
      imageUrl: question.imageUrl,
      description: question.description,
      completed: isCompleted,
    });
  } catch (error) {
    console.error("Error fetching current question:", error);
    return NextResponse.json({ error: "Failed to fetch current question." }, { status: 500 });
  }
}
