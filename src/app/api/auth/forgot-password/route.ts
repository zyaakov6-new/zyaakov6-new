import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/db";
import { ApiResponse } from "@/lib/types";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

// 3 reset requests per 15 minutes per IP
const RESET_LIMIT = { maxRequests: 3, windowSeconds: 900 };

export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers);
  const rl = checkRateLimit(`forgot:${ip}`, RESET_LIMIT);
  if (!rl.allowed) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: `Too many attempts. Try again in ${rl.retryAfterSeconds}s.` },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } }
    );
  }

  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Email is required." },
        { status: 400 }
      );
    }

    // Always return success to avoid user enumeration
    const user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      // Invalidate any existing unused reset tokens for this user
      await prisma.passwordReset.updateMany({
        where: { userId: user.id, usedAt: null },
        data: { usedAt: new Date() },
      });

      const token = randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await prisma.passwordReset.create({
        data: {
          userId: user.id,
          token,
          expiresAt,
        },
      });

      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const resetUrl = `${appUrl}/reset-password?token=${token}`;

      // In production, send this via email (Resend, SendGrid, etc.)
      // For now, log it to the console so you can test locally.
      console.log(`\n[Password Reset] ${email}\n  Link: ${resetUrl}\n`);
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: { message: "If an account with that email exists, a reset link has been generated. Check your server console." },
    });
  } catch (err) {
    console.error("Forgot password error:", err);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Internal server error." },
      { status: 500 }
    );
  }
}
