/* eslint-disable @typescript-eslint/no-explicit-any */
import { adminDb } from "@/lib/firebase-admin";
import CouponsListClient from "@/components/admin/CouponsListClient";

export const dynamic = "force-dynamic";

function toDate(ts: any): Date | null {
  if (!ts) return null;
  if (typeof ts.toDate === "function") return ts.toDate();
  if (ts._seconds) return new Date(ts._seconds * 1000);
  return new Date(ts);
}

export default async function AdminCouponsPage() {
  const snap = await adminDb.collection("coupons").get();

  const coupons = snap.docs.map((doc: any) => {
    const data = doc.data();
    return {
      code: doc.id,
      type: data.type || "percentage",
      value: data.value || 0,
      maxUsage: data.maxUsage || 0,
      usageCount: data.usageCount || 0,
      isActive: data.isActive ?? true,
      productIds: data.productIds || [],
      expiresAt: data.expiresAt ? toDate(data.expiresAt)!.toISOString() : null,
      createdAt: data.createdAt ? toDate(data.createdAt)!.toISOString() : null,
      updatedAt: data.updatedAt ? toDate(data.updatedAt)!.toISOString() : null,
    };
  });

  return <CouponsListClient initialCoupons={coupons} />;
}
