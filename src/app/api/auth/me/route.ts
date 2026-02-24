import { NextRequest, NextResponse } from "next/server";
import { getAuthUserFromRequest } from "@/lib/auth";
import { ApiResponse } from "@/lib/types";

export async function GET(req: NextRequest) {
  const user = await getAuthUserFromRequest(req);
  if (!user) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Not authenticated." },
      { status: 401 }
    );
  }
  return NextResponse.json<ApiResponse>({
    success: true,
    data: { userId: user.userId, email: user.email },
  });
}
