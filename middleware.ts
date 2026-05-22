import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose"; // Run: npm install jose

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("skaute_token")?.value;
  const { pathname } = request.nextUrl;

  const isProtectedRoute =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/profile") ||
    pathname.startsWith("/manage") ||
    pathname.startsWith("/tickets");

  const isAuthPage = pathname === "/auth/signin" || pathname === "/auth/signup";

  // 1. Unauthenticated user trying to access protected paths
  if (isProtectedRoute && !token) {
    const loginUrl = new URL("/auth/signin", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Role Verification for Admin routes
  if (pathname.startsWith("/admin") && token) {
    try {
      // Decode and verify the JWT token
      const { payload } = await jwtVerify(token, JWT_SECRET);

      // Adjust payload.role based on how your backend structures the user claims
      if (payload.role !== "admin") {
        // Redirect non-admins to unauthorized page or profile
        return NextResponse.redirect(new URL("/profile", request.url));
      }
    } catch (error) {
      // Token is invalid or expired
      const loginUrl = new URL("/auth/signin", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 3. Authenticated user trying to look at a Sign In page
  if (isAuthPage && token) {
    return NextResponse.redirect(new URL("/profile", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/profile/:path*",
    "/manage/:path*",
    "/tickets/:path*",
    "/auth/signin",
    "/auth/signup",
  ],
};
