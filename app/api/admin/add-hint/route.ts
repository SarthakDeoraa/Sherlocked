import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hintSchema } from "@/lib/validations/question";
import jwt, { JwtPayload } from "jsonwebtoken";
import { verifyAdminToken } from "@/lib/utils/utils";
const JWT_SECRET: string = process.env.ADMIN_JWT_SECRET!;


export async function POST(req: NextRequest) {
  try {
    const adminToken = await verifyAdminToken(req);
    if (!adminToken) {
      return NextResponse.json(
        { error: "Unauthorized. Admin authentication required." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { questionId, hint } = body;

    // Validate questionId
    if (!questionId || typeof questionId !== "string") {
      return NextResponse.json(
        { error: "Question ID is required." },
        { status: 400 }
      );
    }

    // Validate hint data
    const parsedHint = hintSchema.safeParse(hint);
    if (!parsedHint.success) {
      return NextResponse.json(
        { error: "Invalid hint data.", details: parsedHint.error.errors },
        { status: 400 }
      );
    }

    // Check if question exists
    const existingQuestion = await prisma.question.findUnique({
      where: { id: questionId },
    });

    if (!existingQuestion) {
      return NextResponse.json(
        { error: "Question not found." },
        { status: 404 }
      );
    }

    // Get current hints and add the new hint
    const currentHints = existingQuestion.hints as any[] || [];
    const newHints = [...currentHints, parsedHint.data];

    // Update the question with the new hints array
    const updatedQuestion = await prisma.question.update({
      where: { id: questionId },
      data: {
        hints: newHints,
      },
    });

    return NextResponse.json(
      {
        message: "Hint added successfully.",
        question: {
          id: updatedQuestion.id,
          title: updatedQuestion.title,
          level: updatedQuestion.level,
          hints: updatedQuestion.hints,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error adding hint:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
