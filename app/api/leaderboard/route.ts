import { NextRequest, NextResponse } from "next/server";
import { getLeaderboardData } from "@/lib/websocket-server";

export async function GET(req: NextRequest) {
  try {
    const leaderboard = await getLeaderboardData();
    return NextResponse.json(leaderboard);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch leaderboard." }, { status: 500 });
  }
} 