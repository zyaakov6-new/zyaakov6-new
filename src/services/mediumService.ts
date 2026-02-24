import { PostInput, PublishResult, MediumCredentialConfig } from "@/lib/types";
import { mapToMediumPayload } from "./normalization";

const MEDIUM_API_BASE = "https://api.medium.com/v1";

interface MediumUser {
  id: string;
  username: string;
  name: string;
}

interface MediumPostResponse {
  data: {
    id: string;
    title: string;
    url: string;
    publishStatus: string;
  };
}

/** Fetch the authenticated Medium user (used for "test connection" and getting authorId). */
export async function getMediumUser(
  config: MediumCredentialConfig
): Promise<MediumUser> {
  const res = await fetch(`${MEDIUM_API_BASE}/me`, {
    headers: {
      Authorization: `Bearer ${config.token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Medium API error (${res.status}): ${body}`);
  }

  const json = await res.json();
  return json.data as MediumUser;
}

/** Test that the Medium token is valid. */
export async function testMediumConnection(
  config: MediumCredentialConfig
): Promise<{ valid: boolean; username?: string; error?: string }> {
  try {
    const user = await getMediumUser(config);
    return { valid: true, username: user.username };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { valid: false, error: message };
  }
}

/** Publish a post to Medium under the authenticated user's account. */
export async function publishToMedium(
  post: PostInput,
  config: MediumCredentialConfig
): Promise<PublishResult> {
  try {
    const user = await getMediumUser(config);
    const payload = mapToMediumPayload(post);

    const res = await fetch(
      `${MEDIUM_API_BASE}/users/${user.id}/posts`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Medium publish error (${res.status}): ${body}`);
    }

    const json: MediumPostResponse = await res.json();
    return {
      success: true,
      remoteId: json.data.id,
      remoteUrl: json.data.url,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: message };
  }
}
