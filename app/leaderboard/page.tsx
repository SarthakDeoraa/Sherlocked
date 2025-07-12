"use client";

import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrophyIcon, UsersIcon } from "lucide-react";
import { Navbar } from "@/components/ui/navbar";
import axios from "axios";
import Image from "next/image";

interface LeaderboardEntry {
  teamId: string;
  teamName: string;
  totalScore: number;
  currentLevel: number;
  lastAnswerAt: string | null;
  rank: number;
}

async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  const res = await axios.get("/api/leaderboard");
  return res.data;
}

export default function LeaderboardPage() {
  const queryClient = useQueryClient();

  const {
    data: leaderboard = [],
    isFetching,
    isError,
    error,
  } = useQuery<LeaderboardEntry[], Error>({
    queryKey: ["leaderboard"],
    queryFn: fetchLeaderboard,
    staleTime: 10 * 1000,
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:3001");

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: "GET_LEADERBOARD" }));
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === "LEADERBOARD_UPDATE") {
          queryClient.setQueryData(["leaderboard"], message.data);
        }
      } catch {
        // Ignore parsing errors
      }
    };

    return () => ws.close();
  }, [queryClient]);

  // Show loading state while connection is being established

  return (
    <>
      <Navbar />
      <div className="min-h-screen w-full flex flex-col items-center justify-center relative overflow-x-hidden">
        <div className="fixed inset-0 -z-10">
          <div className="absolute inset-0 bg-black opacity-90" />
          <Image
            src="/landing-bg-compnonent-1.png"
            alt=""
            fill
            className="object-cover opacity-60"
            draggable={false}
          />
          <Image
            src="/landing-bg-compononet-2.png"
            alt=""
            fill
            className="object-cover opacity-40"
            draggable={false}
          />
        </div>
        <div className="w-full max-w-4xl mx-auto px-4 py-16">
          <Card className="bg-white/10 backdrop-blur-md border-none shadow-2xl rounded-3xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 justify-center font-vonca text-4xl md:text-5xl text-white">
                <TrophyIcon className="h-8 w-8 text-yellow-400" />
                Leaderboard
              </CardTitle>
              <div className="flex items-center justify-center gap-4 mt-2">
                <span className="flex items-center gap-2 text-gray-300">
                  <UsersIcon className="h-5 w-5" />
                  {leaderboard.length} teams
                </span>
              </div>
            </CardHeader>
            <CardContent>
              {isFetching ? (
                <div className="text-center py-12 text-gray-400 font-vonca text-xl">
                  Loading...
                </div>
              ) : isError ? (
                <div className="text-center py-12 text-red-400 font-vonca text-xl">
                  {error?.message || "Failed to load leaderboard."}
                </div>
              ) : leaderboard.length === 0 ? (
                <div className="text-center py-12 text-gray-400 font-vonca text-xl">
                  No teams yet. Be the first to play!
                </div>
              ) : (
                <div className="space-y-4">
                  {leaderboard.map((entry) => (
                    <div
                      key={entry.teamId}
                      className={`flex items-center justify-between px-6 py-4 rounded-2xl ${
                        entry.rank === 1
                          ? "bg-yellow-400/20 border-2 border-yellow-400"
                          : entry.rank === 2
                          ? "bg-gray-300/10 border-2 border-gray-300"
                          : entry.rank === 3
                          ? "bg-orange-400/20 border-2 border-orange-400"
                          : "bg-white/5 border border-white/10"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-black/40 font-bold text-white text-2xl font-vonca">
                          {entry.rank}
                        </div>
                        <div>
                          <div className="font-vonca text-lg text-white font-bold">
                            {entry.teamName}
                          </div>
                          <div className="text-xs text-gray-300">
                            Level {entry.currentLevel}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-vonca text-2xl text-white font-bold">
                          {entry.totalScore}
                        </div>
                        <div className="text-xs text-gray-400">points</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
