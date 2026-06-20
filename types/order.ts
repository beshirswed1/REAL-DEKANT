import { Timestamp } from "firebase/firestore";

// ─── Payment & Status ───────────────────────────────────────────────────────
export type PaymentMethod = "cod" | "bank_transfer" | "credit_card" | "whatsapp";

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "shipped"
  | "delivered"
  | "cancelled";

export type PaymentStatus = "pending" | "paid" | "failed";

// ─── Customer ───────────────────────────────────────────────────────────────
export interface Customer {
  name: string;
  phone: string;
  address: string;
  city: string;
}

// ─── Order Item ─────────────────────────────────────────────────────────────
export interface OrderItem {
  productId: string;
  perfumeName: string;
  brand: string;
  image: string;
  size: "3ml" | "5ml" | "10ml";
  quantity: number;
  unitPrice: number;
}

// ─── Order ──────────────────────────────────────────────────────────────────
export interface Order {
  id: string; // Firestore document id
  orderId: string; // Human-readable order number, e.g. "RD-20240001"
  userId: string;
  customer: Customer;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  total: number;
  couponCode?: string;
  discount?: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  trackingNumber?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
