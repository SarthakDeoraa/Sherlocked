import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getToken } from "next-auth/jwt";
import { answerSchema } from "@/lib/validations/answer";

export async function POST(req: NextRequest) {
  try {
    // Parse and validate request body using existing zod schema
    const body = await req.json();
    const parseResult = answerSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.errors[0].message },
        { status: 400 }
      );
    }
    const answer = parseResult.data;

    // Authenticate user
    const token = await getToken({ req });
    if (!token || !token.email) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    // Find user
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

    // Rate limiting: Check if enough time has passed since last activity
    const now = new Date();
    const timeSinceLastActivity = now.getTime() - teamProgress.lastActivityAt.getTime();
    const rateLimitMs = 5000; // 5 seconds

    if (timeSinceLastActivity < rateLimitMs) {
      const remainingTime = Math.ceil((rateLimitMs - timeSinceLastActivity) / 1000);
      return NextResponse.json(
        { 
          error: `Rate limit exceeded. Please wait ${remainingTime} second(s) before submitting another answer.` 
        },
        { status: 429 }
      );
    }

    // Get the current question for the team's level
    const question = await prisma.question.findUnique({
      where: { level: teamProgress.currentLevel },
    });
    if (!question) {
      return NextResponse.json({ error: "No question found for current level." }, { status: 404 });
    }

    // Directly compare the answer as per zod validation (no normalization)
    if (answer.answer !== question.correctAnswer) {
      // Incorrect answer - still update lastActivityAt for rate limiting
      await prisma.teamProgress.update({
        where: { teamId: user.teamId },
        data: { lastActivityAt: now },
      });

      return NextResponse.json(
        { correct: false, message: "Incorrect answer." },
        { status: 200 }
      );
    }

    // Correct answer: update team progress
    // Get the next question (if any)
    const nextQuestion = await prisma.question.findUnique({
      where: { level: teamProgress.currentLevel + 1 },
    });

    let updatedProgress;
    if (nextQuestion) {
      // There is a next level
      updatedProgress = await prisma.teamProgress.update({
        where: { teamId: user.teamId },
        data: {
          currentLevel: teamProgress.currentLevel + 1,
          totalScore: teamProgress.totalScore + question.points,
          lastActivityAt: now,
        },
      });
    } else {
      // No more questions, mark as finished (could add a finishedAt field if needed)
      updatedProgress = await prisma.teamProgress.update({
        where: { teamId: user.teamId },
        data: {
          totalScore: teamProgress.totalScore + question.points,
          lastActivityAt: now,
        },
      });
    }

    return NextResponse.json(
      {
        correct: true,
        message: nextQuestion
          ? "Correct! Proceed to the next level."
          : "Correct! You have completed all levels.",
        nextLevel: nextQuestion ? updatedProgress.currentLevel : null,
        totalScore: updatedProgress.totalScore,
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
