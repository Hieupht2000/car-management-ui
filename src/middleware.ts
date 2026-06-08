/**
 * Next.js Middleware
 * Enforces role-based route protection
 */
import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Skip middleware for these paths
  if (pathname.startsWith("/_next/") || 
      pathname.startsWith("/api/") ||
      pathname.startsWith("/auth") ||
      pathname === "/" ||
      pathname === "/favicon.ico") {
    return NextResponse.next();
  }

  // For /dashboard, admin, and customer routes - check token
  const token = request.cookies.get("token")?.value;
  
  if (!token) {
    // No token - allow page to load, it will redirect to login
    return NextResponse.next();
  }

  // Try to decode and check role
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      return NextResponse.next();
    }

    const payload = JSON.parse(
      Buffer.from(parts[1], "base64").toString("utf-8")
    );
    const role = payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

    // Block non-admin from accessing /admin routes
    if (pathname.startsWith("/admin") && role !== "admin") {
      return NextResponse.redirect(new URL("/customer/dashboard", request.url));
    }
  } catch (error) {
    // If decode fails, let client-side handle it
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard",
    "/admin/:path*",
    "/customer/:path*",
  ],
};
