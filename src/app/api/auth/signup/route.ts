import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { createToken, authCookieOptions } from "@/lib/auth";
import { ApiResponse } from "@/lib/types";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

// 5 signups per 15 minutes per IP
const SIGNUP_LIMIT = { maxRequests: 5, windowSeconds: 900 };

export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers);
  const rl = checkRateLimit(`signup:${ip}`, SIGNUP_LIMIT);
  if (!rl.allowed) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: `Too many attempts. Try again in ${rl.retryAfterSeconds}s.` },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } }
    );
  }

  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Email and password are required." },
        { status: 400 }
      );
    }

    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Password must be at least 8 characters." },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { email, passwordHash },
    });

    const token = await createToken({ userId: user.id, email: user.email });
    const res = NextResponse.json<ApiResponse>(
      { success: true, data: { userId: user.id, email: user.email } },
      { status: 201 }
    );
    res.cookies.set(authCookieOptions(token));
    return res;
  } catch (err) {
    console.error("Signup error:", err);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Internal server error." },
      { status: 500 }
    );
  }
}
