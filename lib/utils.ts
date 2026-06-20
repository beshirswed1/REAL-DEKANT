// lib/utils.ts — General utilities

import { type ClassValue, clsx } from "clsx";

/**
 * Merge Tailwind class names safely (like shadcn/ui's cn helper).
 * Requires: npm i clsx
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/**
 * Format a price number to Arabic locale currency (EGP).
 * @example formatPrice(99.5) → "99.50 ج.م"
 */
export function formatPrice(
  amount: number,
  currency = "EGP",
  locale = "ar-EG"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

/**
 * Generate a URL-friendly slug from a string.
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-");
}

/**
 * Generate a human-readable order ID.
 * @example generateOrderId() → "RD-20240607-4F2A"
 */
export function generateOrderId(): string {
  const date = new Date();
  const datePart = date.toISOString().slice(0, 10).replace(/-/g, "");
  const randPart = Math.random().toString(36).toUpperCase().slice(2, 6);
  return `RD-${datePart}-${randPart}`;
}

/**
 * Calculate order total after coupon discount.
 */
export function calculateTotal(
  subtotal: number,
  shippingFee: number,
  discount = 0
): number {
  return Math.max(subtotal - discount + shippingFee, 0);
}

/**
 * Truncate text to a given length.
 */
export function truncate(text: string, length = 100): string {
  return text.length > length ? text.slice(0, length) + "…" : text;
}
