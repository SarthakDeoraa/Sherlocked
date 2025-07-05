import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"
import { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"
import { JWT } from "next-auth/jwt"

export default withAuth(
async function middleware(req: NextRequest) {
    const { nextUrl } = req
    const token = await getToken({ req })

    // If not logged in, redirect to sign in
    if (!token && nextUrl.pathname !== "/auth/signin") {
        return NextResponse.redirect(new URL("/auth/signin", req.url))
    }

    // If logged in and no team assigned, redirect to setup (unless already on /setup)
    if (token && !token.teamId && nextUrl.pathname !== "/setup") {
        return NextResponse.redirect(new URL("/setup", req.url))
    }

    // If logged in and team assigned, redirect to play (unless already on /play)
    if (token && token.teamId && nextUrl.pathname !== "/play") {
        return NextResponse.redirect(new URL("/play", req.url))
    }
})



export const config = {
  matcher: [
    "/dashboard/:path*",     // protect all /dashboard pages
    "/profile",              // protect /profile
    "/team/:path*",          // protect /team routes
    // add more protected routes here
  ],
}