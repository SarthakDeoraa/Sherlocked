"use client";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/lib/hooks/useAuth";
import {
  UserCircle2,
  LogOut,
  Share2,
  PlayCircle,
  UsersIcon,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";

export function Navbar() {
  const { user, isAuthenticated, signIn, signOut, isLoading } = useAuth();

  // Only fetch invite code if user is team leader
  const { data: inviteCode, isLoading: isInviteLoading } = useQuery({
    queryKey: ["team", "inviteCode"],
    queryFn: async () => {
      const res = await axios.get("/api/get-team-code");
      return res.data.inviteCode as string;
    },
    enabled: !!user?.isTeamLeader,
    staleTime: 60 * 1000,
  });

  function handleShare() {
    if (inviteCode) {
      navigator.clipboard.writeText(inviteCode);
      toast.success("Team invite code copied to clipboard!");
    }
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-transparent flex items-center justify-center">
                <span className="text-white font-bold text-sm">L</span>
              </div>
              <span className="font-bold text-xl text-white">Logo</span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-18">
            <Link
              href="/#about"
              className="text-sm font-medium transition-colors text-white"
            >
              About Us
            </Link>

            <Link
              href="/#rules"
              className="text-sm font-medium transition-colors text-white"
            >
              Rules
            </Link>
            <Link
              href="/leaderboard"
              className="text-sm font-medium transition-colors text-white"
            >
              Leaderboard
            </Link>
          </div>

          {/* Auth Section */}
          <div className="flex items-center">
            {isLoading ? null : isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full p-0 w-10 h-10"
                  >
                    {user.image ? (
                      <Image
                        src={user.image}
                        alt={user.name || "Profile"}
                        width={40}
                        height={40}
                        className="w-10 h-10 rounded-full object-cover border border-white"
                      />
                    ) : (
                      <UserCircle2 className="w-8 h-8 text-white" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    disabled
                    className="flex items-center gap-2"
                  >
                    {user.image ? (
                      <Image
                        src={user.image}
                        alt={user.name || "Profile"}
                        width={24}
                        height={24}
                        className="w-6 h-6 rounded-full object-cover border border-white"
                      />
                    ) : (
                      <UserCircle2 className="w-5 h-5 text-muted-foreground" />
                    )}
                    <span className="truncate max-w-[120px]">
                      {user.name || user.email}
                    </span>
                  </DropdownMenuItem>
                  {user.isTeamLeader && user.teamId && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={handleShare}
                        className="flex items-center gap-2"
                      >
                        <Share2 className="w-4 h-4" />
                        {isInviteLoading
                          ? "Loading..."
                          : "Share Team Invite Code"}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        asChild
                        className="flex items-center gap-2"
                      >
                        <Link
                          href="/play"
                          className="flex items-center gap-2 w-full"
                        >
                          <PlayCircle className="w-4 h-4" /> Play
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  {!user.teamId && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        asChild
                        className="flex items-center gap-2"
                      >
                        <Link
                          href="/setup/join-team"
                          className="flex items-center gap-2 w-full"
                        >
                          <UsersIcon className="w-4 h-4" /> Join Team
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        asChild
                        className="flex items-center gap-2"
                      >
                        <Link
                          href="/setup/create-team"
                          className="flex items-center gap-2 w-full"
                        >
                          <UsersIcon className="w-4 h-4" /> Create Team
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => signOut()}
                    className="flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => signIn("google")}
              >
                Sign In
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
