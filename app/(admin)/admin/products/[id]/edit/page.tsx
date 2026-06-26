/* eslint-disable @typescript-eslint/no-explicit-any */
import { adminDb } from "@/lib/firebase-admin";
import ProductForm from "@/components/admin/ProductForm";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Product, ProductImage } from "@/types";

export const dynamic = "force-dynamic";

interface EditProductPageProps {
  params: { id: string };
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = params;

  // Fetch product
  const docSnap = await adminDb.collection("products").doc(id).get();

  if (!docSnap.exists) {
    notFound();
  }

  const data = docSnap.data()!;

  // Normalize images
  const normalizedImages: ProductImage[] = (data.images || []).map((img: any) => {
    if (typeof img === "string") {
      return { url: img, publicId: "", alt: "" };
    }
    return { url: img.url || "", publicId: img.publicId || "", alt: img.alt || "" };
  });

  const product: Product = {
    id: docSnap.id,
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
    createdAt: data.createdAt?.toMillis?.() || data.createdAt || null,
    updatedAt: data.updatedAt?.toMillis?.() || data.updatedAt || null,
  } as any;

  // Fetch brands for autocomplete
  let brands: string[] = [];
  try {
    const snap = await adminDb.collection("products").get();
    const brandSet = new Set<string>();
    snap.docs.forEach((doc: any) => {
      const brand = doc.data()?.brand;
      if (brand && typeof brand === "string") brandSet.add(brand);
    });
    brands = Array.from(brandSet).sort((a, b) => a.localeCompare(b, "tr"));
  } catch (err) {
    console.error("Failed to fetch brands:", err);
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', width: '100%' }}>
      <div className="admin-page-header" style={{ marginBottom: 24, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link href="/admin/products" className="admin-btn-secondary" style={{ padding: "6px 10px", display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14 }}>
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </Link>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0, color: '#1a1a1a' }}>Ürünü Düzenle</h1>
        </div>
        <p style={{ fontSize: 14, color: "#888", margin: 0, marginLeft: 38 }}>
          {product.brand} — {product.perfumeName}
        </p>
      </div>

      <ProductForm product={product} brands={brands} />
    </div>
  );
}
