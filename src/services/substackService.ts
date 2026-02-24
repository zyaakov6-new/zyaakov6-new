import {
  PostInput,
  PublishResult,
  SubstackCredentialConfig,
} from "@/lib/types";
import { mapToSubstackPayload } from "./normalization";

/**
 * Substack does not have an official public API for creating posts.
 * This service implements the best-effort approach using the internal
 * API endpoints that the Substack web app uses. These endpoints require
 * a valid session cookie.
 *
 * The user provides:
 * - publicationUrl: e.g. "https://yourpub.substack.com"
 * - authToken: a session cookie value (substack.sid)
 *
 * NOTE: This is an unofficial integration. If Substack changes their
 * internal API, this may break. For production use, monitor for changes.
 */

function getSubdomain(publicationUrl: string): string {
  const url = new URL(publicationUrl.replace(/\/+$/, ""));
  // Handle both "yourpub.substack.com" and custom domain setups
  return url.hostname.split(".")[0];
}

function apiBase(publicationUrl: string): string {
  return publicationUrl.replace(/\/+$/, "") + "/api/v1";
}

/** Test Substack connection by fetching the publication info. */
export async function testSubstackConnection(
  config: SubstackCredentialConfig
): Promise<{ valid: boolean; publicationName?: string; error?: string }> {
  try {
    // Try to fetch the publication metadata
    const res = await fetch(apiBase(config.publicationUrl) + "/archive?limit=1", {
      headers: {
        Cookie: `substack.sid=${config.authToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Substack API error (${res.status}): ${body}`);
    }

    return {
      valid: true,
      publicationName: getSubdomain(config.publicationUrl),
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { valid: false, error: message };
  }
}

/**
 * Publish a post to Substack.
 *
 * Uses the internal draft creation endpoint. The flow is:
 * 1. Create a draft via POST /api/v1/drafts
 * 2. Optionally publish the draft via PUT /api/v1/drafts/{id}/publish
 *
 * TODO: If you cannot access Substack's internal APIs from your environment,
 * this will return an error. In that case, you may need to use a headless
 * browser approach or wait for Substack to release an official API.
 */
export async function publishToSubstack(
  post: PostInput,
  config: SubstackCredentialConfig
): Promise<PublishResult> {
  try {
    const payload = mapToSubstackPayload(post);
    const base = apiBase(config.publicationUrl);

    // Step 1: Create a draft
    const draftRes = await fetch(`${base}/drafts`, {
      method: "POST",
      headers: {
        Cookie: `substack.sid=${config.authToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        draft_title: payload.title,
        draft_subtitle: payload.subtitle ?? "",
        draft_body: payload.body_html,
        type: "newsletter",
      }),
    });

    if (!draftRes.ok) {
      const body = await draftRes.text();
      throw new Error(`Substack draft creation error (${draftRes.status}): ${body}`);
    }

    const draft = await draftRes.json();
    const draftId = draft.id;
    const draftSlug = draft.slug;

    // Step 2: If publishing publicly, publish the draft
    if (!payload.draft) {
      const publishRes = await fetch(`${base}/drafts/${draftId}/publish`, {
        method: "PUT",
        headers: {
          Cookie: `substack.sid=${config.authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ send: false }), // Don't email subscribers for now
      });

      if (!publishRes.ok) {
        const body = await publishRes.text();
        throw new Error(
          `Substack publish error (${publishRes.status}): ${body}`
        );
      }
    }

    const pubUrl = config.publicationUrl.replace(/\/+$/, "");
    const remoteUrl = `${pubUrl}/p/${draftSlug ?? draftId}`;

    return {
      success: true,
      remoteId: String(draftId),
      remoteUrl,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: message };
  }
}
