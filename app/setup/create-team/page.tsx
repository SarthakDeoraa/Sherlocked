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

interface Session {
  user: {
    id: string;
    name?: string;
    email?: string;
    image?: string;
    teamId?: string;
    isTeamLeader?: boolean;
  };
}

export default function SetupCreateTeam() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const queryClient = useQueryClient();
  const router = useRouter();

  const createTeamMutation = useMutation({
    mutationFn: async ({
      name,
      description,
    }: {
      name: string;
      description: string;
    }) => {
      const res = await axios.post("/api/setup/create-team", {
        name,
        description,
      });
      return res.data;
    },
    onSuccess: (data) => {
      setName("");
      setDescription("");
      queryClient.setQueryData(
        ["auth", "session"],
        (old: Session | undefined) => {
          if (!old) return old;
          return {
            ...old,
            user: {
              ...old.user,
              teamId: data.id,
              isTeamLeader: true,
            },
          };
        }
      );
      toast.success(
        "Your team has been created. Click profile to play or share team code."
      );
      router.push("/dashboard");
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    createTeamMutation.mutate({ name, description });
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center bg-transparent">
        <Card className="max-w-md w-full mx-auto bg-white/10 backdrop-blur-md border-none shadow-xl rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white font-vonca text-2xl">
              <UsersIcon className="h-6 w-6" />
              Create Team
            </CardTitle>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <Input
                placeholder="Team Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="bg-white/20 text-white placeholder:text-gray-300"
              />
              <Input
                placeholder="Description (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-white/20 text-white placeholder:text-gray-300"
              />
              {createTeamMutation.isError && (
                <div className="text-red-400 text-sm">
                  {createTeamMutation.error instanceof Error
                    ? createTeamMutation.error.message
                    : "Failed to create team."}
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button
                type="submit"
                className="w-full"
                disabled={createTeamMutation.isPending}
              >
                {createTeamMutation.isPending ? "Creating..." : "Create Team"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </>
  );
}
