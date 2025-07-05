import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getToken } from "next-auth/jwt";

export async function GET(req: NextRequest) {
  try {
    // Authenticate user
    const token = await getToken({ req });
    if (!token || !token.email) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    // Find user and their team
    const user = await prisma.user.findUnique({
      where: { email: token.email as string },
      include: { team: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    if (!user.team) {
      return NextResponse.json({ error: "User is not in a team." }, { status: 400 });
    }

    return NextResponse.json(
      { inviteCode: user.team.inviteCode },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in get-team-code route:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
