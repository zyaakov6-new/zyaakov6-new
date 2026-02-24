import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { ApiResponse } from "@/lib/types";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

// 5 reset attempts per 15 minutes per IP
const RESET_LIMIT = { maxRequests: 5, windowSeconds: 900 };

export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers);
  const rl = checkRateLimit(`reset:${ip}`, RESET_LIMIT);
  if (!rl.allowed) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: `Too many attempts. Try again in ${rl.retryAfterSeconds}s.` },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } }
    );
  }

  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Token and password are required." },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Password must be at least 8 characters." },
        { status: 400 }
      );
    }

    const resetRecord = await prisma.passwordReset.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!resetRecord) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Invalid or expired reset link." },
        { status: 400 }
      );
    }

    if (resetRecord.usedAt) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "This reset link has already been used." },
        { status: 400 }
      );
    }

    if (new Date() > resetRecord.expiresAt) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "This reset link has expired. Please request a new one." },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    // Update password and mark token as used in a transaction
    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetRecord.userId },
        data: { passwordHash },
      }),
      prisma.passwordReset.update({
        where: { id: resetRecord.id },
        data: { usedAt: new Date() },
      }),
    ]);

    return NextResponse.json<ApiResponse>({
      success: true,
      data: { message: "Password has been reset. You can now log in." },
    });
  } catch (err) {
    console.error("Reset password error:", err);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Internal server error." },
      { status: 500 }
    );
  }
}
