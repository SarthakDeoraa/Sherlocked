import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt, { JwtPayload } from "jsonwebtoken";

const JWT_SECRET = process.env.ADMIN_JWT_SECRET!;

interface AdminJwtPayload extends JwtPayload {
  isAdmin?: boolean;
}

async function checkAlreadySignedIn(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as AdminJwtPayload;
      if (decoded?.isAdmin) {
        return NextResponse.redirect(new URL("/admin/dashboard", req.url));
      }
    } catch {
      // Token verification failed
    }
  }
  return null;
}

export async function POST(req: NextRequest) {
  const alreadySignedInResponse = await checkAlreadySignedIn(req);
  if (alreadySignedInResponse) return alreadySignedInResponse;

  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required." },
        { status: 400 }
      );
    }

    const admin = await prisma.admin.findUnique({
      where: { username },
    });

    if (!admin) {
      return NextResponse.json(
        { error: "Invalid username or password." },
        { status: 401 }
      );
    }

    const { compare } = await import("bcryptjs");
    const isPasswordValid = await compare(password, admin.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid username or password." },
        { status: 401 }
      );
    }

    const token = jwt.sign(
      {
        sub: admin.id,
        username: admin.username,
        isAdmin: true,
      },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    return NextResponse.json(
      { message: "Admin signed in successfully.", token },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in admin signin route:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}

