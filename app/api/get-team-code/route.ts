import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
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
