import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { createToken, authCookieOptions } from "@/lib/auth";
import { ApiResponse } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Email and password are required." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Invalid email or password." },
        { status: 401 }
      );
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Invalid email or password." },
        { status: 401 }
      );
    }

    const token = await createToken({ userId: user.id, email: user.email });
    const res = NextResponse.json<ApiResponse>({
      success: true,
      data: { userId: user.id, email: user.email },
    });
    res.cookies.set(authCookieOptions(token));
    return res;
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Internal server error." },
      { status: 500 }
    );
  }
}
