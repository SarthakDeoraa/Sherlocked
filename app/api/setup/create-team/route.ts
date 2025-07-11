import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getToken } from "next-auth/jwt";




export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, description } = body;

    // Basic validation for now, to be replaced with zod
    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "Team name is required." }, { status: 400 });
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

    // Prevent creating a new team if user already has a team
    if (user.teamId) {
      return NextResponse.json({ error: "You are already in a team" }, { status: 400 });
    }

    // Create the team and connect the current user as a member and team leader
    const team = await prisma.team.create({
      data: {
        name,
        description,
        members: {
          connect: [{ id: user.id }],
        },
      },
      include: {
        members: true,
      },
    });

    // Create a TeamProgress record for the new team
    const teamProgress = await prisma.teamProgress.create({
      data: {
        teamId: team.id,
      },
    });

    // Update the user to set isTeamLeader = true and assign teamId
    await prisma.user.update({
      where: { id: user.id },
      data: {
        teamId: team.id,
        isTeamLeader: true,
      },
    });

    return NextResponse.json(
      {
        id: team.id,
        name: team.name,
        description: team.description,
        inviteCode: team.inviteCode,
        createdAt: team.createdAt,
        members: team.members.map((member) => ({
          id: member.id,
          email: member.email,
          name: member.name,
          isTeamLeader: member.isTeamLeader,
        })),
        progress: teamProgress,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating team:", error);
    return NextResponse.json({ error: "Failed to create team." }, { status: 500 });
  }
}
