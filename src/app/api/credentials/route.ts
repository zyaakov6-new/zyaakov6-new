import { NextRequest, NextResponse } from "next/server";
import { getAuthUserFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { encryptJSON, decryptJSON } from "@/lib/crypto";
import { ApiResponse } from "@/lib/types";
// With SQLite, providerType is a plain string (no Prisma enum)

/** GET /api/credentials — list all credentials for the current user (configs are NOT returned) */
export async function GET(req: NextRequest) {
  const user = await getAuthUserFromRequest(req);
  if (!user) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Not authenticated." },
      { status: 401 }
    );
  }

  const creds = await prisma.providerCredential.findMany({
    where: { userId: user.userId },
    select: {
      id: true,
      providerType: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return NextResponse.json<ApiResponse>({ success: true, data: creds });
}

/** PUT /api/credentials — upsert a credential for a provider */
export async function PUT(req: NextRequest) {
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

  if (!["MEDIUM", "WORDPRESS", "SUBSTACK"].includes(providerType)) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Invalid provider type." },
      { status: 400 }
    );
  }

  const encrypted = encryptJSON(config);

  const credential = await prisma.providerCredential.upsert({
    where: {
      userId_providerType: {
        userId: authUser.userId,
        providerType: providerType as string,
      },
    },
    update: { config: encrypted },
    create: {
      userId: authUser.userId,
      providerType: providerType as string,
      config: encrypted,
    },
  });

  return NextResponse.json<ApiResponse>({
    success: true,
    data: {
      id: credential.id,
      providerType: credential.providerType,
      updatedAt: credential.updatedAt,
    },
  });
}

/** DELETE /api/credentials?providerType=MEDIUM — remove a credential */
export async function DELETE(req: NextRequest) {
  const authUser = await getAuthUserFromRequest(req);
  if (!authUser) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Not authenticated." },
      { status: 401 }
    );
  }

  const providerType = req.nextUrl.searchParams.get("providerType");
  if (
    !providerType ||
    !["MEDIUM", "WORDPRESS", "SUBSTACK"].includes(providerType)
  ) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Valid providerType query param is required." },
      { status: 400 }
    );
  }

  await prisma.providerCredential.deleteMany({
    where: {
      userId: authUser.userId,
      providerType: providerType as string,
    },
  });

  return NextResponse.json<ApiResponse>({ success: true });
}
