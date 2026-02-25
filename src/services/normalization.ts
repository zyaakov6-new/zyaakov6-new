import {
  PostInput,
  MediumCredentialConfig,
  WordpressCredentialConfig,
} from "@/lib/types";
import { marked } from "marked";

/** Medium API payload shape */
export interface MediumPayload {
  title: string;
  contentFormat: "markdown";
  content: string;
  tags: string[];
  publishStatus: "draft" | "public";
  canonicalUrl?: string;
}

/** WordPress REST API post payload */
export interface WordpressPayload {
  title: string;
  content: string; // HTML
  status: "draft" | "publish";
  excerpt?: string;
  tags?: string[];
  slug?: string;
}

export function mapToMediumPayload(post: PostInput): MediumPayload {
  return {
    title: post.title,
    contentFormat: "markdown",
    content: post.bodyMarkdown,
    tags: post.tags?.slice(0, 5) ?? [], // Medium allows max 5 tags
    publishStatus: post.publishStatus,
    ...(post.canonicalUrl ? { canonicalUrl: post.canonicalUrl } : {}),
  };
}

export function mapToWordpressPayload(post: PostInput): WordpressPayload {
  const html = marked.parse(post.bodyMarkdown) as string;
  return {
    title: post.title,
    content: html,
    status: post.publishStatus === "public" ? "publish" : "draft",
    ...(post.subtitle ? { excerpt: post.subtitle } : {}),
  };
}

/** Re-export config types for convenience */
export type {
  MediumCredentialConfig,
  WordpressCredentialConfig,
};
