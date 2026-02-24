import {
  PostInput,
  PublishResult,
  WordpressCredentialConfig,
} from "@/lib/types";
import { mapToWordpressPayload } from "./normalization";

function wpApiUrl(siteUrl: string, path: string): string {
  const base = siteUrl.replace(/\/+$/, "");
  return `${base}/wp-json/wp/v2${path}`;
}

function basicAuthHeader(config: WordpressCredentialConfig): string {
  const encoded = Buffer.from(
    `${config.username}:${config.applicationPassword}`
  ).toString("base64");
  return `Basic ${encoded}`;
}

/** Test WordPress connection by fetching the current user. */
export async function testWordpressConnection(
  config: WordpressCredentialConfig
): Promise<{ valid: boolean; siteName?: string; error?: string }> {
  try {
    const res = await fetch(wpApiUrl(config.siteUrl, "/users/me"), {
      headers: {
        Authorization: basicAuthHeader(config),
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`WordPress API error (${res.status}): ${body}`);
    }

    const json = await res.json();
    return { valid: true, siteName: json.name ?? config.siteUrl };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { valid: false, error: message };
  }
}

/** Publish a post to WordPress via the REST API. */
export async function publishToWordpress(
  post: PostInput,
  config: WordpressCredentialConfig
): Promise<PublishResult> {
  try {
    const payload = mapToWordpressPayload(post);

    const res = await fetch(wpApiUrl(config.siteUrl, "/posts"), {
      method: "POST",
      headers: {
        Authorization: basicAuthHeader(config),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`WordPress publish error (${res.status}): ${body}`);
    }

    const json = await res.json();
    return {
      success: true,
      remoteId: String(json.id),
      remoteUrl: json.link ?? json.guid?.rendered,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: message };
  }
}
