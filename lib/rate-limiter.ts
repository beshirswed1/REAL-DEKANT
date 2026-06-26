/**
 * Simple in-memory rate limiter for API routes.
 * Tracks request counts per IP within a sliding time window.
 * 
 * NOTE: This works per-instance. On serverless (Vercel), each cold start
 * gets a fresh Map. For stricter limits, use @upstash/ratelimit with Redis.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Cleanup stale entries every 5 minutes to prevent memory leaks
const CLEANUP_INTERVAL = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;

  store.forEach((entry, key) => {
    if (now > entry.resetAt) {
      store.delete(key);
    }
  });
}

/**
 * Check if a request should be rate-limited.
 * 
 * @param identifier - Unique identifier (usually IP address)
 * @param limit - Maximum number of requests allowed in the window
 * @param windowMs - Time window in milliseconds (default: 60 seconds)
 * @returns Object with `limited` boolean and `remaining` count
 */
export function rateLimit(
  identifier: string,
  limit: number = 10,
  windowMs: number = 60_000
): { limited: boolean; remaining: number } {
  cleanup();

  const now = Date.now();
  const entry = store.get(identifier);

  // No existing entry or window expired → start fresh
  if (!entry || now > entry.resetAt) {
    store.set(identifier, { count: 1, resetAt: now + windowMs });
    return { limited: false, remaining: limit - 1 };
  }

  // Increment count
  entry.count++;

  if (entry.count > limit) {
    return { limited: true, remaining: 0 };
  }

  return { limited: false, remaining: limit - entry.count };
}

/**
 * Extract client IP from Next.js request headers.
 * Works with Vercel, Cloudflare, and standard proxies.
 */
export function getClientIp(headers: Headers): string {
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip") ||
    headers.get("cf-connecting-ip") ||
    "unknown"
  );
}
