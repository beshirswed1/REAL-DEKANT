/* eslint-disable @typescript-eslint/no-explicit-any */
import { adminDb } from "@/lib/firebase-admin";
import { notFound } from "next/navigation";
import OrderDetailClient from "@/components/admin/OrderDetailClient";

export const dynamic = "force-dynamic";

interface OrderPageProps {
  params: { id: string };
}

function toDate(ts: any): Date {
  if (!ts) return new Date(0);
  if (typeof ts.toDate === "function") return ts.toDate();
  if (ts._seconds) return new Date(ts._seconds * 1000);
  return new Date(0);
}

export default async function AdminOrderDetailPage({ params }: OrderPageProps) {
  const { id } = params;

  const docSnap = await adminDb.collection("orders").doc(id).get();

  if (!docSnap.exists) {
    notFound();
  }

  const data = docSnap.data()!;

  const order = {
    id: docSnap.id,
    orderId: data.orderId || docSnap.id.slice(0, 8).toUpperCase(),
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

  return <OrderDetailClient order={order} />;
}
