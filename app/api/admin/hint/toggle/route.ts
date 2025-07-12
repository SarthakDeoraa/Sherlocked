import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { verifyAdminToken } from "@/lib/utils/utils";

const toggleHintSchema = z.object({
  hintId: z.string().min(1, "Hint ID is required."),
  isEnabled: z.boolean(),
});

export async function PATCH(req: NextRequest) {
  try {
    const adminToken = await verifyAdminToken(req);
    if (!adminToken) {
      return NextResponse.json(
        { error: "Unauthorized. Admin authentication required." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const parsedBody = toggleHintSchema.safeParse(body);
    if (!parsedBody.success) {
      return NextResponse.json(
        { error: "Invalid request data.", details: parsedBody.error.errors },
        { status: 400 }
      );
    }

    const { hintId, isEnabled } = parsedBody.data;

    const existingHint = await prisma.hint.findUnique({
      where: { id: hintId },
    });

    if (!existingHint) {
      return NextResponse.json(
        { error: "Hint not found." },
        { status: 404 }
      );
    }

    const updatedHint = await prisma.hint.update({
      where: { id: hintId },
      data: { isEnabled },
    });

    return NextResponse.json(
      {
        message: `Hint ${isEnabled ? "enabled" : "disabled"} successfully.`,
        hint: {
          id: updatedHint.id,
          content: updatedHint.content,
          isEnabled: updatedHint.isEnabled,
          questionId: updatedHint.questionId,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error toggling hint:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
} 