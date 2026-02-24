import { NextRequest, NextResponse } from "next/server";
import { getAuthUserFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { decryptJSON } from "@/lib/crypto";
import {
  ApiResponse,
  PostInput,
  MediumCredentialConfig,
  WordpressCredentialConfig,
  SubstackCredentialConfig,
} from "@/lib/types";
import { ProviderType, PublicationStatus } from "@prisma/client";
import { publishToMedium } from "@/services/mediumService";
import { publishToWordpress } from "@/services/wordpressService";
import { publishToSubstack } from "@/services/substackService";

/** GET /api/posts — list the current user's posts */
export async function GET(req: NextRequest) {
  const authUser = await getAuthUserFromRequest(req);
  if (!authUser) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Not authenticated." },
      { status: 401 }
    );
  }

  const posts = await prisma.post.findMany({
    where: { userId: authUser.userId },
    include: {
      publications: {
        select: {
          id: true,
          providerType: true,
          remoteId: true,
          remoteUrl: true,
          status: true,
          errorMessage: true,
          createdAt: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json<ApiResponse>({ success: true, data: posts });
}

/** POST /api/posts — create a post and publish to selected providers */
export async function POST(req: NextRequest) {
  const authUser = await getAuthUserFromRequest(req);
  if (!authUser) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Not authenticated." },
      { status: 401 }
    );
  }

  const body = await req.json();
  const {
    title,
    subtitle,
    bodyMarkdown,
    tags,
    canonicalUrl,
    publishStatus,
    providers,
  } = body as {
    title: string;
    subtitle?: string;
    bodyMarkdown: string;
    tags?: string[];
    canonicalUrl?: string;
    publishStatus: "draft" | "public";
    providers: string[]; // ["MEDIUM", "WORDPRESS", "SUBSTACK"]
  };

  if (!title || !bodyMarkdown) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Title and body are required." },
      { status: 400 }
    );
  }

  if (!providers || providers.length === 0) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: "At least one provider must be selected." },
      { status: 400 }
    );
  }

  // Save the post to DB first
  const post = await prisma.post.create({
    data: {
      userId: authUser.userId,
      title,
      subtitle,
      content: bodyMarkdown,
      tags: tags ?? [],
      canonicalUrl,
    },
  });

  const postInput: PostInput = {
    title,
    subtitle,
    bodyMarkdown,
    tags,
    canonicalUrl,
    publishStatus,
  };

  // Fetch the user's stored credentials for all requested providers
  const credentials = await prisma.providerCredential.findMany({
    where: {
      userId: authUser.userId,
      providerType: { in: providers as ProviderType[] },
    },
  });

  const credMap = new Map(
    credentials.map((c) => [c.providerType, c.config])
  );

  // Publish to each provider in parallel
  const publishPromises = providers.map(async (provider: string) => {
    const encryptedConfig = credMap.get(provider as ProviderType);
    if (!encryptedConfig) {
      return prisma.postPublication.create({
        data: {
          postId: post.id,
          providerType: provider as ProviderType,
          status: "FAILED" as PublicationStatus,
          errorMessage: `No credentials found for ${provider}. Please connect your account first.`,
        },
      });
    }

    let result: { success: boolean; remoteId?: string; remoteUrl?: string; error?: string };

    try {
      const config = decryptJSON(encryptedConfig);
      switch (provider) {
        case "MEDIUM":
          result = await publishToMedium(postInput, config as MediumCredentialConfig);
          break;
        case "WORDPRESS":
          result = await publishToWordpress(postInput, config as WordpressCredentialConfig);
          break;
        case "SUBSTACK":
          result = await publishToSubstack(postInput, config as SubstackCredentialConfig);
          break;
        default:
          result = { success: false, error: `Unknown provider: ${provider}` };
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      result = { success: false, error: message };
    }

    return prisma.postPublication.create({
      data: {
        postId: post.id,
        providerType: provider as ProviderType,
        status: result.success ? "SUCCESS" : "FAILED",
        remoteId: result.remoteId ?? null,
        remoteUrl: result.remoteUrl ?? null,
        errorMessage: result.error ?? null,
      },
    });
  });

  const publications = await Promise.all(publishPromises);

  return NextResponse.json<ApiResponse>({
    success: true,
    data: {
      post: {
        id: post.id,
        title: post.title,
        createdAt: post.createdAt,
      },
      publications: publications.map((p) => ({
        id: p.id,
        providerType: p.providerType,
        status: p.status,
        remoteId: p.remoteId,
        remoteUrl: p.remoteUrl,
        errorMessage: p.errorMessage,
      })),
    },
  });
}
