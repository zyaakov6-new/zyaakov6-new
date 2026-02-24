/**
 * Simple in-memory sliding-window rate limiter.
 * Works per-process — good for single-server deployments.
 * For multi-server, swap this for Redis-based limiting.
 */

interface RateLimitEntry {
  timestamps: number[];
}

const store = new Map<string, RateLimitEntry>();

// Clean up stale entries every 5 minutes
const CLEANUP_INTERVAL = 5 * 60 * 1000;

if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    store.forEach((entry, key) => {
      entry.timestamps = entry.timestamps.filter((t) => now - t < 60_000);
      if (entry.timestamps.length === 0) store.delete(key);
    });
  }, CLEANUP_INTERVAL);
}

export interface RateLimitConfig {
  /** Max requests allowed within the window. */
  maxRequests: number;
  /** Window duration in seconds. */
  windowSeconds: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds?: number;
}

/**
 * Check if a request from `key` is allowed under the given config.
 * Call this with a unique key per IP or IP+endpoint.
 */
export function checkRateLimit(
  key: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const windowMs = config.windowSeconds * 1000;

  let entry = store.get(key);
  if (!entry) {
    entry = { timestamps: [] };
    store.set(key, entry);
  }

  // Remove timestamps outside the window
  entry.timestamps = entry.timestamps.filter((t) => now - t < windowMs);

  if (entry.timestamps.length >= config.maxRequests) {
    const oldest = entry.timestamps[0];
    const retryAfterMs = windowMs - (now - oldest);
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.ceil(retryAfterMs / 1000),
    };
  }

  entry.timestamps.push(now);
  return {
    allowed: true,
    remaining: config.maxRequests - entry.timestamps.length,
  };
}

/**
 * Get client IP from request headers (handles proxies).
 */
export function getClientIp(headers: Headers): string {
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip") ||
    "unknown"
  );
}
