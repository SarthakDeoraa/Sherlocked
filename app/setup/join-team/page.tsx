"use client";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UsersIcon } from "@heroicons/react/24/outline";
import { Navbar } from "@/components/ui/navbar";
import axios from "axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface JoinTeamResponse {
  id: string;
  name: string;
}

interface SessionData {
  user: {
    teamId?: string;
    isTeamLeader?: boolean;
  };
}

export default function SetupJoinTeam() {
  const [inviteCode, setInviteCode] = useState("");
  const queryClient = useQueryClient();
  const router = useRouter();

  const joinTeamMutation = useMutation({
    mutationFn: async ({
      inviteCode,
    }: {
      inviteCode: string;
    }): Promise<JoinTeamResponse> => {
      const res = await axios.post("/api/setup/join-team", { inviteCode });
      return res.data;
    },
    onSuccess: (data: JoinTeamResponse) => {
      setInviteCode("");
      queryClient.setQueryData(
        ["auth", "session"],
        (old: SessionData | null) => {
          if (!old) return old;
          return {
            ...old,
            user: {
              ...old.user,
              teamId: data.id,
              isTeamLeader: false,
            },
          };
        }
      );
      toast.success(
        `You have joined ${
          data?.name || "the team"
        }, click on profile to play Sherlocked`
      );
      // Navigate to the main app or dashboard after successful join
      router.push("/");
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    joinTeamMutation.mutate({ inviteCode });
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center bg-transparent pt-16">
        <Card className="max-w-md w-full bg-white/10 backdrop-blur-md border-none shadow-xl rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white font-vonca text-2xl">
              <UsersIcon className="h-6 w-6" />
              Join Team
            </CardTitle>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <Input
                placeholder="Invite Code"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                required
                className="bg-white/20 text-white placeholder:text-gray-300"
              />
              {joinTeamMutation.isError && (
                <div className="text-red-400 text-sm">
                  {joinTeamMutation.error instanceof Error
                    ? joinTeamMutation.error.message
                    : "Failed to join team."}
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button
                type="submit"
                className="w-full"
                disabled={joinTeamMutation.isPending}
              >
                {joinTeamMutation.isPending ? "Joining..." : "Join Team"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </>
  );
}
