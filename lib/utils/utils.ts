import { NextRequest } from "next/server";
import jwt, { JwtPayload } from "jsonwebtoken";

const JWT_SECRET: string = process.env.ADMIN_JWT_SECRET || "secrett";

interface AdminJwtPayload extends JwtPayload {
  isAdmin?: boolean;
}

export async function verifyAdminToken(req: NextRequest): Promise<AdminJwtPayload | null> {
  const authHeader = req.headers.get("authorization");
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AdminJwtPayload;
    if (decoded && decoded.isAdmin) {
      return decoded;
    }
  } catch (err) {
    return null;
  }
  return null;
}