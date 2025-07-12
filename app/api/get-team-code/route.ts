import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getToken } from "next-auth/jwt";

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req });
    if (!token?.email) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: token.email },
      include: { team: true },
    });

    if (!user?.team) {
      return NextResponse.json(
        { error: user ? "User is not in a team." : "User not found." },
        { status: user ? 400 : 404 }
      );
    }

    return NextResponse.json({ inviteCode: user.team.inviteCode });
  } catch (error) {
    console.error("Error in get-team-code route:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
