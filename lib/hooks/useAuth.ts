import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { useSession, signIn, signOut } from "next-auth/react";

// Fetch session from NextAuth API route for robust React Query integration using axios
import axios from "axios";
async function fetchSession() {
  try {
    const res = await axios.get("/api/auth/session");
    return res.data;
  } catch (error: any) {
    throw new Error("Failed to fetch session");
  }
}

export function useAuth() {
  // NextAuth's useSession for instant client state (optional, for fallback)
  const session = useSession();

  // TanStack Query for full state management and caching
  const {
    data,
    status,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
    isStale,
    isSuccess,
    isPending,
    isFetched,
    isFetchedAfterMount,
    isPlaceholderData,
    isRefetchError,
    isRefetching,
    fetchStatus,
    failureCount,
    dataUpdatedAt,
    errorUpdatedAt,
  }: UseQueryResult<any, Error> = useQuery({
    queryKey: ["auth", "session"],
    queryFn: fetchSession,
    staleTime: 60 * 1000,
    initialData: session.data,
    enabled: true, 
  });

  return {
    user: data?.user,
    status: data ? "authenticated" : "unauthenticated",
    isAuthenticated: !!data?.user,
    signIn,
    signOut,
    session: data,
    // TanStack Query state
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
    isStale,
    isSuccess,
    isPending,
    isFetched,
    isFetchedAfterMount,
    isPlaceholderData,
    isRefetchError,
    isRefetching,
    fetchStatus,
    failureCount,
    dataUpdatedAt,
    errorUpdatedAt,
  };
} 