
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminToken } from "@/lib/utils/utils";

export async function DELETE(req: NextRequest) {
  try {
    const adminToken = await verifyAdminToken(req);
    if (!adminToken) {
      return NextResponse.json(
        { error: "Unauthorized. Admin authentication required." },
        { status: 401 }
      );
    }
    
    const { questionId } = await req.json();

    if (!questionId) {
      return NextResponse.json(
        { error: "Question ID is required." },
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

    await prisma.question.delete({
      where: { id: questionId },
    });

    return NextResponse.json(
      { message: "Question deleted successfully." },
      { status: 200 }
    );
    
  } catch (error) {
    console.error("Error deleting question:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
