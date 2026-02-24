import { ApiResponse } from "./types";

/** Helper for making JSON API calls to our backend. */
export async function apiFetch<T = unknown>(
  url: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  const res = await fetch(url, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers ?? {}),
    },
    ...options,
  });

  const json: ApiResponse<T> = await res.json();
  return json;
}
