import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("kivo_token")?.value;
  const { pathname } = request.nextUrl;

  const isProtectedRoute =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/profile") ||
    pathname.startsWith("/manage") ||
    pathname.startsWith("/tickets");

  const isAuthPage = pathname === "/auth/signin" || pathname === "/auth/signup";

  // 1. Unauthenticated user trying to access protected paths -> Redirect to Sign In
  if (isProtectedRoute && !token) {
    const loginUrl = new URL("/auth/signin", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Authenticated user trying to look at a Sign In page -> Redirect straight to Profile
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
