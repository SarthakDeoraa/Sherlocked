import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getToken } from "next-auth/jwt";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { inviteCode } = body;

    // Basic validation
    if (!inviteCode || typeof inviteCode !== "string") {
      return NextResponse.json({ error: "Invite code is required." }, { status: 400 });
    }

    const token = await getToken({ req });
    if (!token || !token.email) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    // Find the user in the database
    const user = await prisma.user.findUnique({
      where: { email: token.email as string },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    // Check if user is already in a team
    if (user.teamId) {
      return NextResponse.json({ error: "User is already in a team." }, { status: 400 });
    }

    // Find the team by invite code
    const team = await prisma.team.findUnique({
      where: { inviteCode },
      include: { members: true },
    });

    if (!team) {
      return NextResponse.json({ error: "Invalid invite code." }, { status: 404 });
    }

    // Check if team is full
    if (team.members.length >= team.maxMembers) {
      return NextResponse.json({ error: "Team is full." }, { status: 400 });
    }

    // Add user to the team
    await prisma.user.update({
      where: { id: user.id },
      data: {
        teamId: team.id,
        isTeamLeader: false,
      },
    });

    // Optionally, re-fetch the team with updated members
    const updatedTeam = await prisma.team.findUnique({
      where: { id: team.id },
      include: { members: true },
    });

    return NextResponse.json(
      {
        id: updatedTeam?.id,
        name: updatedTeam?.name,
        description: updatedTeam?.description,
        inviteCode: updatedTeam?.inviteCode,
        createdAt: updatedTeam?.createdAt,
        members: updatedTeam?.members.map((member) => ({
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
