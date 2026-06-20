/* eslint-disable @typescript-eslint/no-explicit-any */
import { adminDb } from "@/lib/firebase-admin";
import OrdersListClient from "@/components/admin/OrdersListClient";

export const dynamic = "force-dynamic";

function toDate(ts: any): Date {
  if (!ts) return new Date(0);
  if (typeof ts.toDate === "function") return ts.toDate();
  if (ts._seconds) return new Date(ts._seconds * 1000);
  return new Date(0);
}

export default async function AdminOrdersPage() {
  const snap = await adminDb.collection("orders").orderBy("createdAt", "desc").limit(200).get();

  const orders = snap.docs.map((doc: any) => {
    const data = doc.data();
    return {
      id: doc.id,
      orderId: data.orderId || doc.id.slice(0, 8).toUpperCase(),
      customer: {
        name: data.customer?.name || "Bilinmiyor",
        email: data.customer?.email || "",
        phone: data.customer?.phone || "",
        city: data.customer?.city || "",
        district: data.customer?.district || "",
        address: data.customer?.address || "",
      },
      items: data.items || [],
      subtotal: data.subtotal || 0,
      shippingFee: data.shippingFee || 0,
      discount: data.discount || 0,
      total: data.total || 0,
      paymentMethod: data.paymentMethod || "cod",
      paymentStatus: data.paymentStatus || "pending",
      orderStatus: data.orderStatus || "pending",
      appliedCoupon: data.appliedCoupon || null,
      trackingNumber: data.trackingNumber || null,
      createdAt: toDate(data.createdAt).toISOString(),
      updatedAt: toDate(data.updatedAt).toISOString(),
    };
  });

  // Sort descending by date in-memory
  orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Deduplicate by orderId (keep the first occurrence - newest due to sort)
  const seen = new Set<string>();
  const uniqueOrders = orders.filter((o) => {
    const key = o.orderId;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return <OrdersListClient initialOrders={uniqueOrders} />;
}
