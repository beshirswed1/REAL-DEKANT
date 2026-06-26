/* eslint-disable @typescript-eslint/no-explicit-any */
import { adminDb } from "@/lib/firebase-admin";
import ProductListClient from "@/components/admin/ProductListClient";
import type { Product } from "@/types";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  // Fetch all products server-side
  const snap = await adminDb
    .collection("products")
    .orderBy("createdAt", "desc")
    .get();

  const products: Product[] = snap.docs.map((doc: any) => {
    const data = doc.data();

    // Normalize images: support both old string[] and new object[] formats
    const normalizedImages = (data.images || []).map((img: any) => {
      if (typeof img === "string") {
        return { url: img, publicId: "", alt: "" };
      }
      return img;
    });

    // Serialize Firestore timestamps to plain objects for client
    return {
      id: doc.id,
      sku: data.sku || "",
      brand: data.brand || "",
      perfumeName: data.perfumeName || "",
      slug: data.slug || "",
      gender: data.gender || "unisex",
      concentration: data.concentration || "EDP",
      prices: data.prices || { "3ml": 0, "5ml": 0, "10ml": 0 },
      compareAtPrices: data.compareAtPrices || {},
      availability: data.availability || "in_stock",
      scentFamily: data.scentFamily || [],
      notes: data.notes || { top: [], heart: [], base: [] },
      longevity: data.longevity || "",
      sillage: data.sillage || "",
      season: data.season || [],
      timeOfDay: data.timeOfDay || [],
      images: normalizedImages,
      isPublished: data.isPublished ?? false,
      isFeatured: data.isFeatured ?? false,
      isNew: data.isNew ?? false,
      stock: data.stock ?? 0,
      soldCount: data.soldCount ?? 0,
      tags: data.tags || [],
      adminNote: data.adminNote || "",
      createdAt: data.createdAt?._seconds
        ? { seconds: data.createdAt._seconds, nanoseconds: data.createdAt._nanoseconds || 0 }
        : null,
      updatedAt: data.updatedAt?._seconds
        ? { seconds: data.updatedAt._seconds, nanoseconds: data.updatedAt._nanoseconds || 0 }
        : null,
    } as any;
  });

  return <ProductListClient products={products} />;
}
