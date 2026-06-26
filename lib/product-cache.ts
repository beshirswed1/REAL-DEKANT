import { adminDb } from "@/lib/firebase-admin";
import type { Product } from "@/types";

// ─── In-memory product cache ──────────────────────────────────────────────────
// Prevents redundant Firestore reads when multiple requests arrive concurrently.
// Cache auto-expires after TTL_MS.
let cachedProducts: Product[] | null = null;
let cacheTimestamp = 0;
let activeProductsPromise: Promise<Product[]> | null = null;
const TTL_MS = 5 * 60 * 1000; // 5 minutes
const RETRY_COOLDOWN_MS = 30 * 1000; // 30 seconds

/**
 * Fetch ALL published products using Firebase Admin SDK (server-side only).
 * Results are cached in-memory for TTL_MS to handle concurrent traffic.
 * Uses promise-sharing to prevent cache stampedes and thundering herds.
 */
export async function getPublishedProducts(): Promise<Product[]> {
  const now = Date.now();

  // 1. Return cached data if still fresh
  if (cachedProducts && now - cacheTimestamp < TTL_MS) {
    return cachedProducts;
  }

  // 2. If there is already an active fetch in progress, reuse the same promise (prevents Cache Stampede)
  if (activeProductsPromise) {
    return activeProductsPromise;
  }

  // 3. Start new fetch and cache its promise (Thread-safe concurrency lock)
  activeProductsPromise = (async () => {
    try {
      const snapshot = await adminDb
        .collection("products")
        .where("isPublished", "==", true)
        .get();

      const products: Product[] = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          // Convert Firestore admin Timestamps to plain objects for serialization
          createdAt: data.createdAt
            ? { seconds: data.createdAt.seconds, nanoseconds: data.createdAt.nanoseconds }
            : null,
          updatedAt: data.updatedAt
            ? { seconds: data.updatedAt.seconds, nanoseconds: data.updatedAt.nanoseconds }
            : null,
          newUntil: data.newUntil
            ? { seconds: data.newUntil.seconds, nanoseconds: data.newUntil.nanoseconds }
            : null,
        } as Product;
      });

      // Update cache and timestamp on success
      cachedProducts = products;
      cacheTimestamp = Date.now();
      return products;
    } catch (error) {
      console.warn("[product-cache] Firestore fetch failed:", error);

      // Graceful Fallback with System Protection (Circuit Breaker Cooldown)
      // Set timestamp so we don't try to query Firestore again for RETRY_COOLDOWN_MS (30 seconds)
      cacheTimestamp = Date.now() - TTL_MS + RETRY_COOLDOWN_MS;

      if (cachedProducts) {
        console.warn("[product-cache] Returning stale cached data. Cooldown active for 30s.");
        return cachedProducts;
      }

      // If we don't have a cache yet, store an empty array as a temporary cache
      // so other concurrent requests get this instantly without hitting the database.
      cachedProducts = [];
      return [];
    } finally {
      // Clear the active promise ref when done so next expired cycle can fetch again
      activeProductsPromise = null;
    }
  })();

  return activeProductsPromise;
}

/**
 * Fetch a single published product by slug.
 * Uses the cached products list to avoid extra Firestore reads.
 */
export async function getPublishedProductBySlug(slug: string): Promise<Product | null> {
  const products = await getPublishedProducts();
  return products.find((p) => p.slug === slug) || null;
}

/**
 * Force-clear the cache (useful after admin product updates).
 */
export function invalidateProductCache(): void {
  cachedProducts = null;
  cacheTimestamp = 0;
  activeProductsPromise = null;
}
