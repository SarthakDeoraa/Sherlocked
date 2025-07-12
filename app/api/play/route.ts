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

    // Check if already completed all levels
    const totalQuestions = await prisma.question.count();
    if (teamProgress.currentLevel > totalQuestions) {
      return NextResponse.json(
        {
          correct: true,
          message: "🎉 Congratulations! You have completed all levels and won the hunt! 🎉",
          nextLevel: null,
          totalScore: teamProgress.totalScore,
          completed: true,
        },
        { status: 200 }
      );
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

    // Get total number of questions and check if current level is the final level
    const isFinalLevel = teamProgress.currentLevel >= totalQuestions;

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

    // Always increment level, even if it's the final level
    updateData.currentLevel = teamProgress.currentLevel + 1;

    const updatedProgress = await prisma.teamProgress.update({
      where: { teamId: user.teamId },
      data: updateData,
    });

    const responseTime = Date.now() - startTime;
    await handleAnswer(user.teamId, true, responseTime);

    return NextResponse.json(
      {
        correct: true,
        message: isFinalLevel
          ? "🎉 Congratulations! You have completed all levels and won the hunt! 🎉"
          : "Correct! Proceed to the next level.",
        nextLevel: isFinalLevel ? null : updatedProgress.currentLevel,
        totalScore: updatedProgress.totalScore,
        completed: isFinalLevel,
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

    const totalQuestions = await prisma.question.count();
    
    // Check if already completed all levels (currentLevel > totalQuestions)
    if (teamProgress.currentLevel > totalQuestions) {
      return NextResponse.json({
        level: totalQuestions,
        title: "Hunt Complete!",
        imageUrl: null,
        description: "🎉 Congratulations! You have completed all levels and won the hunt! 🎉",
        completed: true,
      });
    }

    const question = await prisma.question.findUnique({
      where: { level: teamProgress.currentLevel },
    });
    if (!question) {
      return NextResponse.json({ error: "No question found for current level." }, { status: 404 });
    }

    // The hunt is NOT completed yet since we're still within the question range
    return NextResponse.json({
      level: question.level,
      title: question.title,
      imageUrl: question.imageUrl,
      description: question.description,
      completed: false,
    });
  } catch (error) {
    console.error("Error fetching current question:", error);
    return NextResponse.json({ error: "Failed to fetch current question." }, { status: 500 });
  }
}