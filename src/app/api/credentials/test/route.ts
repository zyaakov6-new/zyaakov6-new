import { NextRequest, NextResponse } from "next/server";
import { getAuthUserFromRequest } from "@/lib/auth";
import { ApiResponse } from "@/lib/types";
import { testMediumConnection } from "@/services/mediumService";
import { testWordpressConnection } from "@/services/wordpressService";

/** POST /api/credentials/test — test a provider's credentials without saving them */
export async function POST(req: NextRequest) {
  const authUser = await getAuthUserFromRequest(req);
  if (!authUser) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Not authenticated." },
      { status: 401 }
    );
  }

  const { providerType, config } = await req.json();

  if (!providerType || !config) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: "providerType and config are required." },
      { status: 400 }
    );
  }

  let result: { valid: boolean; error?: string; [key: string]: unknown };

  switch (providerType) {
    case "MEDIUM":
      result = await testMediumConnection(config);
      break;
    case "WORDPRESS":
      result = await testWordpressConnection(config);
      break;
    default:
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Invalid provider type." },
        { status: 400 }
      );
  }

  return NextResponse.json<ApiResponse>({
    success: result.valid,
    data: result,
    error: result.error,
  });
}
