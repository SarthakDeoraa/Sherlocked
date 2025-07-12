import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export default withAuth(
async function middleware(req: NextRequest) {
    const { nextUrl } = req;
    const token = await getToken({ req });

    if (!token && nextUrl.pathname !== "/auth/signin") {
        return NextResponse.redirect(new URL("/auth/signin", req.url));
    }

    if (token && !token.teamId && nextUrl.pathname !== "/setup") {
        return NextResponse.redirect(new URL("/setup", req.url));
    }

    if (token && token.teamId && nextUrl.pathname !== "/play") {
        return NextResponse.redirect(new URL("/play", req.url));
    }
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile",
    "/team/:path*",
  ],
};