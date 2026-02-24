import { NextResponse } from "next/server";
import { ApiResponse } from "@/lib/types";

export async function POST() {
  const res = NextResponse.json<ApiResponse>({ success: true });
  res.cookies.set({
    name: "auth_token",
    value: "",
    maxAge: 0,
    path: "/",
  });
  return res;
}
