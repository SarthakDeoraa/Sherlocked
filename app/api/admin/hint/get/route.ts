import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { verifyAdminToken } from "@/lib/utils/utils";

const getHintsQuerySchema = z.object({
  questionId: z.string().min(1, "Question ID is required."),
  enabledOnly: z.boolean().optional().default(true),
});

export async function GET(req: NextRequest) {
  try {
    const adminToken = await verifyAdminToken(req);
    if (!adminToken) {
      return NextResponse.json(
        { error: "Unauthorized. Admin authentication required." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const questionId = searchParams.get("questionId");
    const enabledOnly = searchParams.get("enabledOnly") !== "false";

    const parsedQuery = getHintsQuerySchema.safeParse({
      questionId,
      enabledOnly,
    });

    if (!parsedQuery.success) {
      return NextResponse.json(
        { error: "Invalid query parameters.", details: parsedQuery.error.errors },
        { status: 400 }
      );
    }

    const { questionId: validatedQuestionId, enabledOnly: validatedEnabledOnly } = parsedQuery.data;

    const existingQuestion = await prisma.question.findUnique({
      where: { id: validatedQuestionId },
    });

    if (!existingQuestion) {
      return NextResponse.json(
        { error: "Question not found." },
        { status: 404 }
      );
    }

    const whereClause = {
      questionId: validatedQuestionId,
      ...(validatedEnabledOnly && { isEnabled: true }),
    };

    const hints = await prisma.hint.findMany({
      where: whereClause,
      orderBy: { id: "asc" },
    });

    const enabledHintsCount = hints.filter(hint => hint.isEnabled).length;

    return NextResponse.json(
      {
        question: {
          id: existingQuestion.id,
          title: existingQuestion.title,
          level: existingQuestion.level,
        },
        hints: hints.map(hint => ({
          id: hint.id,
          content: hint.content,
          isEnabled: hint.isEnabled,
          questionId: hint.questionId,
        })),
        totalHints: hints.length,
        enabledHints: enabledHintsCount,
        disabledHints: hints.length - enabledHintsCount,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error getting hints:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
} 