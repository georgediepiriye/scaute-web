import { NextResponse, NextRequest } from "next/server";

const AUTH_ROUTES = ["/auth/signin", "/auth/signup", "/auth/forgot"];
const ADMIN_ROUTES = ["/admin", "/admin/dashboard"];
const PROTECTED_ROUTES = ["/profile", "/manage", "/dashboard"];

function decodeJwtEdge(token: string) {
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;

    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );

    return JSON.parse(jsonPayload);
  } catch (err) {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  // 1. Handle Logged-In Users visiting Auth Pages
  if (token && AUTH_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL("/profile", request.url));
  }

  // Improved matching checks to safeguard sub-routes accurately
  const isProtectedPath = PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
  const isAdminPath = ADMIN_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  // 2. Handle Guest Access on Protected Pages
  if (!token && (isProtectedPath || isAdminPath)) {
    if (pathname === "/" || pathname.startsWith("/e/")) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL("/auth/signin", request.url));
  }

  // 3. Handle Strict Admin Authorization Check
  if (token && isAdminPath) {
    const decodedPayload = decodeJwtEdge(token);

    // Deep scanning payload extraction fields
    const userRole =
      decodedPayload?.role ||
      decodedPayload?.user?.role ||
      decodedPayload?.userInfo?.role ||
      decodedPayload?.status;

    console.log("Extracted Role:", userRole);
    console.log("=============================");

    // 💡 TO TEMPORARILY BYPASS FOR TESTING:
    // Change this to: if (false) {
    // That will let you into the dashboard once so you can see your real data structure.
    if (!userRole || String(userRole).toLowerCase() !== "admin") {
      console.warn(
        `Admin access denied for path: ${pathname}. Found role: ${userRole}`,
      );
      return NextResponse.redirect(new URL("/profile", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/profile/:path*",
    "/dashboard/:path*",
    "/manage/:path*",
    "/auth/:path*",
  ],
};
