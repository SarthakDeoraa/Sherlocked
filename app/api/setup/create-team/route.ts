import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

interface CreateTeamBody {
  name: string;
  description?: string;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body: CreateTeamBody = await req.json();
    const { name, description } = body;

    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "Team name is required." }, { status: 400 });
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
      return NextResponse.json({ error: "You are already in a team" }, { status: 400 });
    }

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

    const teamProgress = await prisma.teamProgress.create({
      data: {
        teamId: team.id,
      },
    });

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
