import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const TOKEN_COOKIE = "auth_token";

// Routes that require authentication
const PROTECTED_PREFIXES = ["/dashboard", "/accounts", "/posts"];

// Routes that should never be blocked (public pages + API auth routes)
const PUBLIC_PATHS = ["/", "/login", "/signup"];
const PUBLIC_API_PREFIXES = ["/api/auth/"];

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET env var is required.");
  return new TextEncoder().encode(secret);
}

function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix + "/")
  );
}

function isPublicApiRoute(pathname: string): boolean {
  return PUBLIC_API_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Let public pages and public API routes through
  if (PUBLIC_PATHS.includes(pathname) || isPublicApiRoute(pathname)) {
    return NextResponse.next();
  }

  // Only guard protected routes
  if (!isProtectedRoute(pathname)) {
    return NextResponse.next();
  }

  // Check for auth token
  const token = req.cookies.get(TOKEN_COOKIE)?.value;

  if (!token) {
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  // Verify the JWT is valid
  try {
    await jwtVerify(token, getSecret());
    return NextResponse.next();
  } catch {
    // Invalid or expired token — clear cookie and redirect
    const loginUrl = new URL("/login", req.url);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete(TOKEN_COOKIE);
    return response;
  }
}

export const config = {
  // Run middleware on all routes except static files and Next.js internals
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
