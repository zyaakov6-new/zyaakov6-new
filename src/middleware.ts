import { NextRequest, NextResponse } from "next/server";
<<<<<<< HEAD
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
=======
import { verifyToken } from "@/lib/auth";

const PUBLIC_PATHS = ["/", "/login", "/signup", "/forgot-password", "/reset-password"];
const PUBLIC_API_PATHS = ["/api/auth/login", "/api/auth/signup", "/api/auth/logout", "/api/auth/forgot-password", "/api/auth/reset-password"];
>>>>>>> 4f5944151f983dd0abd96fc787cea906fd114bcb

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

<<<<<<< HEAD
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
=======
  // Allow static assets and Next.js internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Allow public pages
  if (PUBLIC_PATHS.includes(pathname)) {
    return NextResponse.next();
  }

  // Allow public API routes
  if (PUBLIC_API_PATHS.includes(pathname)) {
    return NextResponse.next();
  }

  // Check auth token
  const token = req.cookies.get("auth_token")?.value;
  if (!token) {
    // API routes get 401, pages get redirected
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { success: false, error: "Not authenticated." },
        { status: 401 }
      );
    }
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const user = await verifyToken(token);
  if (!user) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { success: false, error: "Not authenticated." },
        { status: 401 }
      );
    }
    const res = NextResponse.redirect(new URL("/login", req.url));
    res.cookies.set({ name: "auth_token", value: "", maxAge: 0, path: "/" });
    return res;
  }

  // Authenticated users visiting login/signup go to dashboard
  if (pathname === "/login" || pathname === "/signup") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
>>>>>>> 4f5944151f983dd0abd96fc787cea906fd114bcb
};
