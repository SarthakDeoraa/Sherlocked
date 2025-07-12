import { NextRequest } from "next/server";
import jwt, { JwtPayload } from "jsonwebtoken";

const JWT_SECRET = process.env.ADMIN_JWT_SECRET || "secrett";

interface AdminJwtPayload extends JwtPayload {
  isAdmin?: boolean;
}

export async function verifyAdminToken(
  req: NextRequest
): Promise<AdminJwtPayload | null> {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AdminJwtPayload;
    return decoded?.isAdmin ? decoded : null;
  } catch {
    return null;
  }
}