import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminToken } from "@/lib/utils/utils";

export async function GET(req: NextRequest) {
  try {
    const adminToken = await verifyAdminToken(req);
    if (!adminToken) {
      return NextResponse.json(
        { error: "Unauthorized. Admin authentication required." },
        { status: 401 }
      );
    }

    const questions = await prisma.question.findMany({
      orderBy: { level: "asc" },
      include: {
        hints: {
          orderBy: { id: "asc" },
        },
      },
    });

    return NextResponse.json({ questions }, { status: 200 });
  } catch (error) {
    console.error("Error fetching questions:", error);
    return NextResponse.json(
      { error: "Failed to fetch questions." },
      { status: 500 }
    );
  }
} 