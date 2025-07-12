import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { inviteCode } = body;

    if (!inviteCode || typeof inviteCode !== "string") {
      return NextResponse.json({ error: "Invite code is required." }, { status: 400 });
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    if (user.teamId) {
      return NextResponse.json({ error: "User is already in a team." }, { status: 400 });
    }

    const team = await prisma.team.findUnique({
      where: { inviteCode },
      include: { members: true },
    });

    if (!team) {
      return NextResponse.json({ error: "Invalid invite code." }, { status: 404 });
    }

    if (team.members.length >= team.maxMembers) {
      return NextResponse.json({ error: "Team is full." }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        teamId: team.id,
        isTeamLeader: false,
      },
    });

    const updatedTeam = await prisma.team.findUnique({
      where: { id: team.id },
      include: { members: true },
    });

    if (!updatedTeam) {
      return NextResponse.json({ error: "Failed to update team." }, { status: 500 });
    }

    return NextResponse.json(
      {
        id: updatedTeam.id,
        name: updatedTeam.name,
        description: updatedTeam.description,
        inviteCode: updatedTeam.inviteCode,
        createdAt: updatedTeam.createdAt,
        members: updatedTeam.members.map((member) => ({
          id: member.id,
          email: member.email,
          name: member.name,
          isTeamLeader: member.isTeamLeader,
        })),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error joining team:", error);
    return NextResponse.json({ error: "Failed to join team." }, { status: 500 });
  }
}
