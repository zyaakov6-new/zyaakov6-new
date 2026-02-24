import { NextRequest, NextResponse } from "next/server";
import { getAuthUserFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ApiResponse } from "@/lib/types";

/** GET /api/dashboard — summary stats for the dashboard */
export async function GET(req: NextRequest) {
  const authUser = await getAuthUserFromRequest(req);
  if (!authUser) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Not authenticated." },
      { status: 401 }
    );
  }

  const [connectedAccounts, totalPosts, recentPosts] = await Promise.all([
    prisma.providerCredential.count({
      where: { userId: authUser.userId },
    }),
    prisma.post.count({
      where: { userId: authUser.userId },
    }),
    prisma.post.findMany({
      where: { userId: authUser.userId },
      include: {
        publications: {
          select: {
            providerType: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const successfulPublications = await prisma.postPublication.count({
    where: {
      post: { userId: authUser.userId },
      status: "SUCCESS",
    },
  });

  return NextResponse.json<ApiResponse>({
    success: true,
    data: {
      connectedAccounts,
      totalPosts,
      successfulPublications,
      recentPosts,
    },
  });
}
