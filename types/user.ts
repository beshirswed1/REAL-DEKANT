import { Timestamp } from "firebase/firestore";

// ─── Address ─────────────────────────────────────────────────────────────────
export interface Address {
  label: string; // e.g. "Home", "Work"
  name: string;
  phone: string;
  address: string;
  city: string;
  isDefault: boolean;
}

// ─── User Role ────────────────────────────────────────────────────────────────
export type UserRole = "customer" | "admin";

// ─── User ─────────────────────────────────────────────────────────────────────
export interface AppUser {
  uid: string;
  email: string;
  displayName: string;
  phone?: string;
  photoURL?: string;
  role: UserRole;
  addresses: Address[];
  wishlist: string[]; // productIds
  createdAt: Timestamp;
}
