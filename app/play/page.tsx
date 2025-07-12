"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/hooks/useAuth";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Navbar } from "@/components/ui/navbar";
import { HintPopup } from "@/components/ui/hint-popup";
import axios from "axios";
import { toast } from "sonner";
import type { AxiosError } from "axios";

interface Question {
  level: number;
  title: string;
  imageUrl?: string;
  completed?: boolean;
}

interface HintsData {
  hints: { id: string; content: string }[];
}

interface SubmitResponse {
  correct: boolean;
  message?: string;
  completed?: boolean;
}

export default function PlayPage() {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [answer, setAnswer] = useState("");

  const {
    data: question,
    isLoading,
    isError,
    error,
  } = useQuery<Question>({
    queryKey: ["play", "current-question"],
    queryFn: async () => {
      const res = await axios.get("/api/play");
      return res.data;
    },
    enabled: isAuthenticated && !!user?.teamId,
    refetchOnWindowFocus: true,
  });

  const {
    data: hintsData,
    isLoading: isHintsLoading,
    isError: isHintsError,
  } = useQuery<HintsData>({
    queryKey: ["play", "hints"],
    queryFn: async () => {
      const res = await axios.get("/api/hint");
      return res.data;
    },
    enabled: isAuthenticated && !!user?.teamId && !!question,
    refetchOnWindowFocus: true,
  });

  const submitMutation = useMutation<SubmitResponse, Error, { answer: string }>(
    {
      mutationFn: async (payload) => {
        const res = await axios.post("/api/play", { answer: payload.answer });
        return res.data;
      },
      onSuccess: (data) => {
        setAnswer("");
        queryClient.invalidateQueries({
          queryKey: ["play", "current-question"],
        });
        if (data?.completed) {
          toast.success(
            data.message ||
              "🎉 Congratulations! You've completed all levels! 🎉",
            {
              style: { background: "#22c55e", color: "white" },
            }
          );
        } else if (data?.correct) {
          toast.success(data.message || "Correct answer!", {
            style: { background: "#22c55e", color: "white" },
          });
        } else if (data?.correct === false) {
          toast.error(data.message || "Try again, wrong answer.", {
            style: { background: "#ef4444", color: "white" },
          });
        }
      },
      onError: (error) => {
        const err = error as AxiosError;
        if (err.response?.status === 429) {
          toast("Wait 5 seconds after every try.", {
            style: { background: "#fbbf24", color: "black" },
          });
        }
      },
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer.trim()) return;
    submitMutation.mutate({ answer });
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center bg-transparent pt-16">
        <Card className="max-w-lg w-full mx-auto bg-white/10 backdrop-blur-md border-none shadow-xl rounded-2xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-center text-white font-vonca text-2xl flex-1">
                {isLoading
                  ? "Loading..."
                  : isError
                  ? "Error"
                  : question
                  ? `LEVEL - ${question.level}`
                  : "No Question"}
              </CardTitle>
              {question && (
                <HintPopup
                  hints={hintsData?.hints || []}
                  isLoading={isHintsLoading}
                  isError={isHintsError}
                />
              )}
            </div>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6 flex flex-col items-center">
              {isLoading ? (
                <div className="text-gray-300">Loading question...</div>
              ) : isError ? (
                <div className="text-red-400">
                  {error?.message || "Failed to load question."}
                </div>
              ) : question ? (
                <>
                  {question?.completed ? (
                    <div className="text-center text-green-400 text-xl font-semibold mb-4">
                      🎉 Congratulations! You have completed all levels! 🎉
                    </div>
                  ) : (
                    <>
                      <div className="text-center text-white text-xl font-semibold mb-2">
                        {question.title}
                      </div>
                      {question.imageUrl && (
                        <a
                          href={question.imageUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-blue-300 underline text-center mb-2"
                        >
                          View Image
                        </a>
                      )}
                      <Input
                        placeholder="Your answer..."
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        className="bg-white/20 text-white placeholder:text-gray-300 text-center"
                        disabled={submitMutation.isPending}
                      />
                    </>
                  )}
                </>
              ) : (
                <div className="text-gray-300">No question available.</div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col items-center">
              <Button
                type="submit"
                className="w-full"
                disabled={
                  isLoading ||
                  !question ||
                  submitMutation.isPending ||
                  question?.completed
                }
              >
                {submitMutation.isPending
                  ? "Submitting..."
                  : question?.completed
                  ? "Completed!"
                  : "Submit"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </>
  );
}
