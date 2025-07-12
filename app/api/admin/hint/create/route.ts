import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hintSchema } from "@/lib/validations/question";
import { verifyAdminToken } from "@/lib/utils/utils";

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
    const { questionId, content, isEnabled = true } = body;

    if (!questionId || typeof questionId !== "string") {
      return NextResponse.json(
        { error: "Question ID is required." },
        { status: 400 }
      );
    }

    const parsedHint = hintSchema.safeParse({ content, isEnabled });
    if (!parsedHint.success) {
      return NextResponse.json(
        { error: "Invalid hint data.", details: parsedHint.error.errors },
        { status: 400 }
      );
    }

    const existingQuestion = await prisma.question.findUnique({
      where: { id: questionId },
    });

    if (!existingQuestion) {
      return NextResponse.json(
        { error: "Question not found." },
        { status: 404 }
      );
    }

    const hint = await prisma.hint.create({
      data: {
        questionId,
        content: parsedHint.data.content,
        isEnabled: parsedHint.data.isEnabled,
      },
    });

    return NextResponse.json(
      {
        message: "Hint created successfully.",
        hint: {
          id: hint.id,
          content: hint.content,
          isEnabled: hint.isEnabled,
          questionId: hint.questionId,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating hint:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
} 