/* eslint-disable @typescript-eslint/no-explicit-any */
import { adminDb } from "@/lib/firebase-admin";
import ProductForm from "@/components/admin/ProductForm";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  // Fetch existing brands for autocomplete
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
    <>
      <div className="admin-page-header">
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
            <Link href="/admin/products" className="admin-btn-secondary" style={{ padding: "6px 10px" }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14 }}>
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </Link>
            <h1>Yeni Ürün Ekle</h1>
          </div>
          <p style={{ fontSize: 14, color: "#888" }}>
            Yeni bir parfüm ürünü oluşturun
          </p>
        </div>
      </div>

      <ProductForm brands={brands} />
    </>
  );
}
