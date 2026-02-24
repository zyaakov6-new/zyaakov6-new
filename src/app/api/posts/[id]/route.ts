import { NextRequest, NextResponse } from "next/server";
import { getAuthUserFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ApiResponse } from "@/lib/types";

/** GET /api/posts/:id — get a single post with its publications */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authUser = await getAuthUserFromRequest(req);
  if (!authUser) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Not authenticated." },
      { status: 401 }
    );
  }

  const post = await prisma.post.findFirst({
    where: { id: params.id, userId: authUser.userId },
    include: {
      publications: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!post) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Post not found." },
      { status: 404 }
    );
  }

  const parsed = {
    ...post,
    tags: JSON.parse(post.tags || "[]") as string[],
  };

  return NextResponse.json<ApiResponse>({ success: true, data: parsed });
}
