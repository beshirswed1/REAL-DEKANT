import { Timestamp } from "firebase/firestore";

// ─── Price Sizes ────────────────────────────────────────────────────────────
export type PriceSize = "3ml" | "5ml" | "10ml";

export interface ProductPrices {
  "3ml": number;
  "5ml": number;
  "10ml": number;
}

export interface CompareAtPrices {
  "3ml"?: number;
  "5ml"?: number;
  "10ml"?: number;
}

// ─── Scent / Notes ──────────────────────────────────────────────────────────
export interface ScentNotes {
  top: string[];
  heart: string[];
  base: string[];
}

// ─── Product Image ──────────────────────────────────────────────────────────
export interface ProductImage {
  url: string;
  publicId: string;
  alt: string;
}

// ─── Enums / Literals ───────────────────────────────────────────────────────
export type Gender = "male" | "female" | "unisex";

export type Concentration = "EDP" | "EDT" | "Parfum" | "EDC";

export type Availability =
  | "in_stock"
  | "out_of_stock"
  | "coming_soon"
  | "limited";

export type Longevity = "Zayıf" | "Orta" | "Güçlü" | "Canavar";

export type Sillage = "Hafif" | "Orta" | "Güçlü" | "Yoğun";

// ─── Product ────────────────────────────────────────────────────────────────
export interface Product {
  id: string; // Firestore document id
  sku: string;
  brand: string;
  perfumeName: string;
  slug: string;
  gender: Gender;
  concentration: Concentration;
  prices: ProductPrices;
  compareAtPrices?: CompareAtPrices;
  availability: Availability;
  scentFamily: string[];
  notes: ScentNotes;
  longevity: string;
  sillage: string;
  season: string[];
  timeOfDay: string[];
  images: ProductImage[];
  isPublished: boolean;
  isFeatured: boolean;
  isNew: boolean;
  newUntil?: Timestamp;
  stock: number;
  soldCount: number;
  tags: string[];
  adminNote?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ─── Cart Item ───────────────────────────────────────────────────────────────
export interface CartItem {
  id: string;
  productId: string;
  sku: string;
  perfumeName: string;
  brand: string;
  size: PriceSize;
  price: number;
  qty: number;
  image: string;
  slug: string;
}
