/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb, isMock } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

// ─── Auth helper ──────────────────────────────────────────────────────────────
async function verifyAdmin(req: NextRequest) {
  const token = req.cookies.get("rd_admin")?.value;
  if (!token) return false;
  try {
    const decoded = await adminAuth.verifySessionCookie(token, true);
    return !!decoded.admin;
  } catch {
    return false;
  }
}

// ─── Slug generator (Turkish-safe) ────────────────────────────────────────────
function generateSlug(brand: string, name: string): string {
  const turkishMap: Record<string, string> = {
    ç: "c", ğ: "g", ı: "i", ö: "o", ş: "s", ü: "u",
    Ç: "C", Ğ: "G", İ: "I", Ö: "O", Ş: "S", Ü: "U",
  };
  const text = `${brand} ${name}`.toLowerCase();
  return text
    .replace(/[çğıöşüÇĞİÖŞÜ]/g, (c) => turkishMap[c] || c)
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

// ─── GET: Fetch all products ──────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const isAdmin = await verifyAdmin(req);
  if (!isAdmin) {
    return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
  }

  try {
    const snap = await adminDb.collection("products").get();

    const products = snap.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ products });
  } catch (error: any) {
    console.error("Products GET error:", error);
    return NextResponse.json(
      { error: "Ürünler yüklenemedi" },
      { status: 500 }
    );
  }
}

// ─── POST: Create new product ──────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const isAdmin = await verifyAdmin(req);
  if (!isAdmin) {
    return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
  }

  if (isMock) {
    return NextResponse.json(
      { error: "FIREBASE_SERVICE_ACCOUNT_KEY eksik! Lütfen .env.local dosyasına ekleyin." },
      { status: 500 }
    );
  }

  try {
    const body = await req.json();

    // Generate slug
    const slug = generateSlug(body.brand || "", body.perfumeName || "");

    // Check slug uniqueness
    const existing = await adminDb
      .collection("products")
      .where("slug", "==", slug)
      .limit(1)
      .get();

    const finalSlug = existing.empty ? slug : `${slug}-${Date.now().toString(36)}`;

    const productData = {
      sku: body.sku || "",
      brand: body.brand || "",
      perfumeName: body.perfumeName || "",
      slug: finalSlug,
      gender: body.gender || "unisex",
      concentration: body.concentration || "EDP",
      prices: body.prices || { "3ml": 0, "5ml": 0, "10ml": 0 },
      compareAtPrices: body.compareAtPrices || {},
      availability: body.availability || "in_stock",
      scentFamily: body.scentFamily || [],
      notes: body.notes || { top: [], heart: [], base: [] },
      longevity: body.longevity || "Orta",
      sillage: body.sillage || "Orta",
      season: body.season || [],
      timeOfDay: body.timeOfDay || [],
      images: body.images || [],
      isPublished: body.isPublished ?? false,
      isFeatured: body.isFeatured ?? false,
      isNew: body.isNew ?? false,
      newUntil: body.isNew ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : null,
      stock: body.stock ?? 0,
      soldCount: 0,
      tags: body.tags || [],
      adminNote: body.adminNote || "",
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    const docRef = await adminDb.collection("products").add(productData);

    return NextResponse.json({
      success: true,
      id: docRef.id,
      slug: finalSlug,
    });
  } catch (error: any) {
    console.error("Product POST error:", error);
    return NextResponse.json(
      { error: "Ürün oluşturulamadı: " + (error.message || "") },
      { status: 500 }
    );
  }
}

// ─── PUT: Update existing product ─────────────────────────────────────────────
export async function PUT(req: NextRequest) {
  const isAdmin = await verifyAdmin(req);
  if (!isAdmin) {
    return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
  }

  if (isMock) {
    return NextResponse.json(
      { error: "FIREBASE_SERVICE_ACCOUNT_KEY eksik! Lütfen .env.local dosyasına ekleyin." },
      { status: 500 }
    );
  }

  try {
    const body = await req.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: "ID gerekli" }, { status: 400 });
    }

    // If brand or name changed, regenerate slug
    if (updateData.brand || updateData.perfumeName) {
      const currentDoc = await adminDb.collection("products").doc(id).get();
      const current = currentDoc.data();
      const brand = updateData.brand || current?.brand || "";
      const name = updateData.perfumeName || current?.perfumeName || "";
      updateData.slug = generateSlug(brand, name);

      // Check slug uniqueness (exclude current doc)
      const existing = await adminDb
        .collection("products")
        .where("slug", "==", updateData.slug)
        .limit(2)
        .get();

      const otherDocs = existing.docs.filter((d: any) => d.id !== id);
      if (otherDocs.length > 0) {
        updateData.slug = `${updateData.slug}-${Date.now().toString(36)}`;
      }
    }

    // Handle isNew toggle → set newUntil
    if (updateData.isNew === true) {
      updateData.newUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    } else if (updateData.isNew === false) {
      updateData.newUntil = null;
    }

    updateData.updatedAt = FieldValue.serverTimestamp();

    await adminDb.collection("products").doc(id).update(updateData);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Product PUT error:", error);
    return NextResponse.json(
      { error: "Ürün güncellenemedi: " + (error.message || "") },
      { status: 500 }
    );
  }
}

// ─── DELETE: Delete product ────────────────────────────────────────────────────
export async function DELETE(req: NextRequest) {
  const isAdmin = await verifyAdmin(req);
  if (!isAdmin) {
    return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
  }

  if (isMock) {
    return NextResponse.json(
      { error: "FIREBASE_SERVICE_ACCOUNT_KEY eksik! Lütfen .env.local dosyasına ekleyin." },
      { status: 500 }
    );
  }

  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "ID gerekli" }, { status: 400 });
    }

    // Delete Firestore document (ImgBB images don't need server-side deletion)
    await adminDb.collection("products").doc(id).delete();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Product DELETE error:", error);
    return NextResponse.json(
      { error: "Ürün silinemedi: " + (error.message || "") },
      { status: 500 }
    );
  }
}
