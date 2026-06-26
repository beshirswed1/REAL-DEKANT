import { adminDb } from "@/lib/firebase-admin";

export interface CouponData {
  isActive?: boolean;
  expiresAt?: { toDate?: () => Date } | Date | string | null;
  usageCount?: number;
  usedCount?: number;
  maxUsage?: number;
  maxUses?: number;
  productIds?: string[];
  type?: string;
  discountType?: string;
  value?: number;
  discountValue?: number;
}

interface CachedCoupon {
  exists: boolean;
  data: CouponData | null;
  timestamp: number;
}

// In-memory dictionary to store cached coupons by code
const couponCache: Record<string, CachedCoupon | undefined> = {};
const activeCouponPromises: Record<string, Promise<{ exists: boolean; data?: CouponData | null }> | undefined> = {};

const TTL_MS = 2 * 60 * 1000; // 2 minutes cache
const RETRY_COOLDOWN_MS = 10 * 1000; // 10 seconds cooldown on database failure

/**
 * Fetch a coupon by code using Firebase Admin SDK (server-side only).
 * Results are cached in-memory and shared between concurrent requests
 * to prevent database bottlenecks.
 */
export async function getCachedCoupon(code: string): Promise<{ exists: boolean; data?: CouponData | null }> {

  const normalizedCode = code.trim().toUpperCase();
  const now = Date.now();

  // 1. Return cached data if still fresh
  const cached = couponCache[normalizedCode];
  if (cached && now - cached.timestamp < TTL_MS) {
    return { exists: cached.exists, data: cached.data };
  }

  // 2. Share active promise if fetch is already in progress
  if (activeCouponPromises[normalizedCode]) {
    return activeCouponPromises[normalizedCode];
  }

  // 3. Initiate fetch and cache promise
  activeCouponPromises[normalizedCode] = (async () => {
    try {
      const docRef = adminDb.collection("coupons").doc(normalizedCode);
      const docSnap = await docRef.get();

      const result = {
        exists: docSnap.exists,
        data: docSnap.exists ? (docSnap.data() as CouponData) : null,
        timestamp: Date.now(),
      };

      couponCache[normalizedCode] = result;
      return { exists: result.exists, data: result.data };
    } catch (error) {
      console.warn(`[coupon-cache] Firestore fetch failed for coupon ${normalizedCode}:`, error);

      // On failure, set cooldown so we don't query Firestore again for 10 seconds
      couponCache[normalizedCode] = {
        exists: cached ? cached.exists : false,
        data: cached ? cached.data : null,
        timestamp: Date.now() - TTL_MS + RETRY_COOLDOWN_MS,
      };

      if (cached) {
        return { exists: cached.exists, data: cached.data };
      }
      return { exists: false };
    } finally {
      delete activeCouponPromises[normalizedCode];
    }
  })();

  return activeCouponPromises[normalizedCode];
}

/**
 * Invalidate a specific coupon's cache.
 */
export function invalidateCouponCache(code: string): void {
  const normalizedCode = code.trim().toUpperCase();
  delete couponCache[normalizedCode];
  delete activeCouponPromises[normalizedCode];
}
