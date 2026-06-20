/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb, isMock } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

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

// ─── GET: Fetch all coupons ──────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const isAdmin = await verifyAdmin(req);
  if (!isAdmin) {
    return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
  }

  try {
    const snap = await adminDb.collection("coupons").get();
    const coupons = snap.docs.map((doc: any) => {
      const data = doc.data();
      return {
        code: doc.id,
        ...data,
        expiresAt: data.expiresAt ? (typeof data.expiresAt.toDate === "function" ? data.expiresAt.toDate().toISOString() : new Date(data.expiresAt).toISOString()) : null,
        createdAt: data.createdAt ? (typeof data.createdAt.toDate === "function" ? data.createdAt.toDate().toISOString() : new Date(data.createdAt).toISOString()) : null,
        updatedAt: data.updatedAt ? (typeof data.updatedAt.toDate === "function" ? data.updatedAt.toDate().toISOString() : new Date(data.updatedAt).toISOString()) : null,
      };
    });

    return NextResponse.json({ coupons });
  } catch (error: any) {
    console.error("Coupons GET error:", error);
    return NextResponse.json(
      { error: "Kuponlar yüklenemedi" },
      { status: 500 }
    );
  }
}

// ─── POST: Create/Update coupon ────────────────────────────────────────────────
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
    const { code, type, value, maxUsage, expiresAt, isActive, productIds } = body;

    if (!code || !type || value === undefined) {
      return NextResponse.json({ error: "Gerekli alanlar eksik" }, { status: 400 });
    }

    const couponCode = code.trim().toUpperCase();

    // Check if code exists on creation
    const docRef = adminDb.collection("coupons").doc(couponCode);
    const docSnap = await docRef.get();

    const couponData = {
      type,
      value: parseFloat(value),
      maxUsage: parseInt(maxUsage) || 0,
      usageCount: docSnap.exists ? (docSnap.data()?.usageCount || 0) : 0,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      isActive: isActive ?? true,
      productIds: productIds || [],
      createdAt: docSnap.exists ? (docSnap.data()?.createdAt || FieldValue.serverTimestamp()) : FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    await docRef.set(couponData, { merge: true });

    return NextResponse.json({ success: true, code: couponCode });
  } catch (error: any) {
    console.error("Coupon POST error:", error);
    return NextResponse.json(
      { error: "Kupon oluşturulamadı: " + (error.message || "") },
      { status: 500 }
    );
  }
}

// ─── DELETE: Delete coupon ────────────────────────────────────────────────────
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
    const { code } = await req.json();

    if (!code) {
      return NextResponse.json({ error: "Kod gerekli" }, { status: 400 });
    }

    await adminDb.collection("coupons").doc(code.toUpperCase()).delete();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Coupon DELETE error:", error);
    return NextResponse.json(
      { error: "Kupon silinemedi: " + (error.message || "") },
      { status: 500 }
    );
  }
}
