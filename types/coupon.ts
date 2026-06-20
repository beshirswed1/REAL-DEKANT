import { Timestamp } from "firebase/firestore";

// ─── Discount Type ───────────────────────────────────────────────────────────
export type DiscountType = "percentage" | "fixed";

// ─── Coupon ──────────────────────────────────────────────────────────────────
export interface Coupon {
  id: string; // Firestore document id
  code: string; // e.g. "SAVE20"
  discountType: DiscountType;
  discountValue: number; // 20 = 20% or 20 LE depending on type
  minOrderAmount: number; // minimum cart subtotal to apply
  maxUses: number; // 0 = unlimited
  usedCount: number;
  expiresAt: Timestamp;
  isActive: boolean;
}
