import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Read auth tokens safely from request cookies
  const token = request.cookies.get("skaute_token")?.value;
  const userRole = request.cookies.get("user_role")?.value;

  // 1. GATE RESTRICTED LOCATIONS: /admin/* and /profile
  if (pathname.startsWith("/admin") || pathname === "/profile") {
    if (!token) {
      const loginUrl = new URL("/auth/signin", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Role Enforcement Barrier
    if (pathname.startsWith("/admin") && userRole !== "admin") {
      return NextResponse.redirect(new URL("/profile", request.url));
    }
  }

  // 2. GATE PUBLIC AUTH FORMS: /auth/signin and /auth/signup
  if (pathname.startsWith("/auth")) {
    if (token) {
      if (userRole === "admin") {
        return NextResponse.redirect(new URL("/admin/dashboard", request.url));
      }
      return NextResponse.redirect(new URL("/profile", request.url));
    }
  }

  return NextResponse.next();
}

// Strictly configure which paths pass through authorization checks
export const config = {
  matcher: ["/admin/:path*", "/profile", "/auth/:path*"],
};
