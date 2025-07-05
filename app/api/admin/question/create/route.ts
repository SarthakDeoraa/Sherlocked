
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { questionSchema } from "@/lib/validations/question";
import jwt, { JwtPayload } from "jsonwebtoken";
const JWT_SECRET: string = process.env.ADMIN_JWT_SECRET!;
import { verifyAdminToken } from "@/lib/utils/utils";


export async function POST(req: NextRequest) {

    const adminToken = await verifyAdminToken(req);
    if (!adminToken) {
      return NextResponse.json(
        { error: "Unauthorized. Admin authentication required." },
        { status: 401 }
      );
    }
  try {
    const data = await req.json();

    const parsed = questionSchema.safeParse(data);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid question data.", details: parsed.error.errors },
        { status: 400 }
      );
    }
    // Check if a question with the same level already exists
    const existingQuestion = await prisma.question.findUnique({
      where: { level: parsed.data.level },
    });

    if (existingQuestion) {
      return NextResponse.json(
        { error: `A question with level ${parsed.data.level} already exists. Each question must have a unique level.` },
        { status: 400 }
      );
    }
    const question = await prisma.question.create({
      data: parsed.data,
    });

    return NextResponse.json(
      { message: "Question created successfully.", question },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating question:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
