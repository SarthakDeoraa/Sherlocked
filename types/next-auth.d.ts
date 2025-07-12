import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      isTeamLeader?: boolean;
      teamId?: string;
      profilePicture?: string;
    };
  }

  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    isTeamLeader?: boolean;
    teamId?: string;
    profilePicture?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
  }
} 