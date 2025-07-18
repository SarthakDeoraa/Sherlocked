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

interface SignInResponse {
  token: string;
}

export default function AdminSignIn() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axios.post<SignInResponse>("/api/admin/signin", {
        username,
        password,
      });
      if (res.data.token) {
        localStorage.setItem("admin_jwt", res.data.token);
        router.replace("/admin/dashboard");
      } else {
        setError("Invalid response from server.");
      }
    } catch (err) {
      const axiosError = err as AxiosError<{ error: string }>;
      setError(
        axiosError?.response?.data?.error || "Sign in failed. Please try again."
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
            Admin Sign In
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
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-white/20 text-white placeholder:text-gray-300"
              disabled={loading}
            />
            {error && (
              <div className="text-red-400 text-sm text-center">{error}</div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-3">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing In..." : "Sign In"}
            </Button>
            <div className="text-center text-gray-300 text-sm">
              Don&apos;t have an account?{" "}
              <a
                href="/admin/signup"
                className="text-blue-400 hover:text-blue-300 underline"
              >
                Sign Up
              </a>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
