"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Navbar } from "@/components/ui/navbar";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

export default function AdminDashboard() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const [newQuestion, setNewQuestion] = useState({
    level: "",
    title: "",
    description: "",
    imageUrl: "",
    points: "",
    correctAnswer: "",
  });
  const [newHint, setNewHint] = useState<Record<string, string>>({});

  // Check admin JWT on mount
  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("admin_jwt") : null;
    if (!token) {
      router.replace("/admin/signin");
    }
  }, [router]);

  // Close modal on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setShowModal(false);
      }
    }
    if (showModal) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showModal]);

  // Helper to get admin JWT
  const getAuthHeader = () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("admin_jwt") : null;
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // Fetch all questions (with hints)
  const {
    data: questions,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["admin-questions"],
    queryFn: async () => {
      const res = await axios.get("/api/admin/question/list", { headers: getAuthHeader() });
      return res.data.questions;
    },
    refetchOnWindowFocus: true,
  });

  // Create question mutation
  const createQuestionMutation = useMutation({
    mutationFn: async (payload: typeof newQuestion) => {
      const res = await axios.post(
        "/api/admin/question/create",
        {
          ...payload,
          level: Number(payload.level),
          points: Number(payload.points),
        },
        { headers: getAuthHeader() }
      );
      return res.data;
    },
    onSuccess: () => {
      toast.success("Question created!");
      setShowModal(false);
      setNewQuestion({ level: "", title: "", description: "", imageUrl: "", points: "", correctAnswer: "" });
      queryClient.invalidateQueries({ queryKey: ["admin-questions"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.error || "Failed to create question");
    },
  });

  // Add hint mutation
  const addHintMutation = useMutation({
    mutationFn: async ({ questionId, content }: { questionId: string; content: string }) => {
      const res = await axios.post(
        "/api/admin/hint/create",
        { questionId, content },
        { headers: getAuthHeader() }
      );
      return res.data;
    },
    onSuccess: (_, { questionId }) => {
      toast.success("Hint added!");
      setNewHint(h => ({ ...h, [questionId]: "" }));
      queryClient.invalidateQueries({ queryKey: ["admin-questions"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.error || "Failed to add hint");
    },
  });

  // Toggle hint mutation
  const toggleHintMutation = useMutation({
    mutationFn: async ({ hintId, isEnabled }: { hintId: string; isEnabled: boolean }) => {
      const res = await axios.patch(
        "/api/admin/hint/toggle",
        { hintId, isEnabled },
        { headers: getAuthHeader() }
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-questions"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.error || "Failed to toggle hint");
    },
  });

  // Delete question mutation
  const deleteQuestionMutation = useMutation({
    mutationFn: async (questionId: string) => {
      const res = await axios.delete(
        "/api/admin/question/delete",
        { data: { questionId }, headers: getAuthHeader() }
      );
      return res.data;
    },
    onSuccess: () => {
      toast.success("Question deleted!");
      queryClient.invalidateQueries({ queryKey: ["admin-questions"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.error || "Failed to delete question");
    },
  });

  // Modal form submit
  function handleCreateQuestion(e: React.FormEvent) {
    e.preventDefault();
    createQuestionMutation.mutate(newQuestion);
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex flex-col items-center bg-transparent pt-24 relative">
        {/* Floating + button */}
        <button
          className="fixed bottom-8 left-8 z-50 bg-yellow-400 hover:bg-yellow-500 text-white rounded-full shadow-lg p-4 flex items-center justify-center focus:outline-none"
          onClick={() => setShowModal(true)}
          aria-label="Create Question"
        >
          <Plus className="h-7 w-7" />
        </button>

        {/* Modal for create question */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md">
            <div ref={modalRef} className="w-full max-w-lg mx-4">
              <Card className="bg-white/10 backdrop-blur-md border-none shadow-xl rounded-2xl">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-lg font-semibold text-white flex-1 text-center">
                    Create Question
                  </CardTitle>
                  <Button
                    onClick={() => setShowModal(false)}
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <form className="space-y-3 px-6 pb-6" onSubmit={handleCreateQuestion}>
                  <Input
                    placeholder="Level (number)"
                    value={newQuestion.level}
                    onChange={e => setNewQuestion(q => ({ ...q, level: e.target.value }))}
                    className="bg-white/20 text-gray-900 placeholder:text-gray-400"
                    required
                  />
                  <Input
                    placeholder="Title"
                    value={newQuestion.title}
                    onChange={e => setNewQuestion(q => ({ ...q, title: e.target.value }))}
                    className="bg-white/20 text-gray-900 placeholder:text-gray-400"
                    required
                  />
                  <Input
                    placeholder="Description"
                    value={newQuestion.description}
                    onChange={e => setNewQuestion(q => ({ ...q, description: e.target.value }))}
                    className="bg-white/20 text-gray-900 placeholder:text-gray-400"
                    required
                  />
                  <Input
                    placeholder="Image URL (optional)"
                    value={newQuestion.imageUrl}
                    onChange={e => setNewQuestion(q => ({ ...q, imageUrl: e.target.value }))}
                    className="bg-white/20 text-gray-900 placeholder:text-gray-400"
                  />
                  <Input
                    placeholder="Points"
                    value={newQuestion.points}
                    onChange={e => setNewQuestion(q => ({ ...q, points: e.target.value }))}
                    className="bg-white/20 text-gray-900 placeholder:text-gray-400"
                    required
                  />
                  <Input
                    placeholder="Correct Answer"
                    value={newQuestion.correctAnswer}
                    onChange={e => setNewQuestion(q => ({ ...q, correctAnswer: e.target.value }))}
                    className="bg-white/20 text-gray-900 placeholder:text-gray-400"
                    required
                  />
                  <Button type="submit" className="w-full" disabled={createQuestionMutation.isPending}>
                    {createQuestionMutation.isPending ? "Creating..." : "Create Question"}
                  </Button>
                </form>
              </Card>
            </div>
          </div>
        )}

        <div className="w-full max-w-3xl space-y-8 mt-4">
          {isLoading ? (
            <div className="text-gray-300 text-center">Loading questions...</div>
          ) : isError ? (
            <div className="text-red-400 text-center">{error instanceof Error ? error.message : "Failed to load questions."}</div>
          ) : !questions || questions.length === 0 ? (
            <div className="text-gray-300 text-center">No questions yet.</div>
          ) : (
            questions.map((q: any) => (
              <Card key={q.id} className="bg-white/10 backdrop-blur-md border-none shadow-lg rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-white font-vonca text-xl flex items-center justify-between">
                    <span>Level {q.level}: {q.title}</span>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteQuestionMutation.mutate(q.id)}
                      disabled={deleteQuestionMutation.isPending}
                    >
                      Delete
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-gray-200 mb-2">{q.description}</div>
                  {q.imageUrl && (
                    <a href={q.imageUrl} target="_blank" rel="noopener noreferrer" className="text-blue-300 underline mb-2 block">View Image</a>
                  )}
                  <div className="mt-4">
                    <div className="text-yellow-300 font-semibold mb-2">Hints</div>
                    <div className="space-y-2">
                      {q.hints.length === 0 && <div className="text-gray-400">No hints yet.</div>}
                      {q.hints.map((hint: any) => (
                        <div key={hint.id} className="flex items-center justify-between bg-yellow-50/10 rounded px-3 py-2">
                          <span className={hint.isEnabled ? "text-yellow-200" : "text-gray-400 line-through"}>{hint.content}</span>
                          <div className="flex gap-2">
                            <Button
                              variant={hint.isEnabled ? "secondary" : "outline"}
                              size="sm"
                              onClick={() => toggleHintMutation.mutate({ hintId: hint.id, isEnabled: !hint.isEnabled })}
                              disabled={toggleHintMutation.isPending}
                            >
                              {hint.isEnabled ? "Disable" : "Enable"}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <form
                      className="flex gap-2 mt-3"
                      onSubmit={e => {
                        e.preventDefault();
                        addHintMutation.mutate({ questionId: q.id, content: newHint[q.id] });
                      }}
                    >
                      <Input
                        placeholder="Add a hint..."
                        value={newHint[q.id] || ""}
                        onChange={e => setNewHint(h => ({ ...h, [q.id]: e.target.value }))}
                        className="bg-white/20 text-white placeholder:text-gray-300"
                        required
                        disabled={addHintMutation.isPending}
                      />
                      <Button type="submit" disabled={addHintMutation.isPending}>
                        {addHintMutation.isPending ? "Adding..." : "Add"}
                      </Button>
                    </form>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </>
  );
} 