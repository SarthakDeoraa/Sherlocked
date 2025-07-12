"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import axios, { AxiosError } from "axios";

interface SignUpResponse {
  message: string;
}

export default function AdminSignUp() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post<SignUpResponse>("/api/admin/signup", {
        username,
        password,
      });
      if (res.data.message) {
        // Redirect to signin page after successful signup
        router.replace("/admin/signin");
      }
    } catch (err) {
      const axiosError = err as AxiosError<{ error: string }>;
      setError(
        axiosError?.response?.data?.error || "Sign up failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
      <Card className="w-full max-w-md bg-white/10 backdrop-blur-md border-none shadow-xl rounded-2xl">
        <CardHeader>
          <CardTitle className="text-center text-white font-vonca text-2xl">
            Admin Sign Up
          </CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <Input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-white/20 text-white placeholder:text-gray-300"
              autoFocus
              disabled={loading}
              required
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-white/20 text-white placeholder:text-gray-300"
              disabled={loading}
              required
            />
            <Input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="bg-white/20 text-white placeholder:text-gray-300"
              disabled={loading}
              required
            />
            {error && (
              <div className="text-red-400 text-sm text-center">{error}</div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-3">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating Account..." : "Sign Up"}
            </Button>
            <div className="text-center text-gray-300 text-sm">
              Already have an account?{" "}
              <a
                href="/admin/signin"
                className="text-blue-400 hover:text-blue-300 underline"
              >
                Sign In
              </a>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
