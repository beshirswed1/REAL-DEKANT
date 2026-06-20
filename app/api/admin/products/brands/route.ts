/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

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

// ─── GET: Fetch distinct brand names for autocomplete ─────────────────────────
export async function GET(req: NextRequest) {
  const isAdmin = await verifyAdmin(req);
  if (!isAdmin) {
    return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
  }

  try {
    const snap = await adminDb.collection("products").get();

    const brandSet = new Set<string>();
    snap.docs.forEach((doc: any) => {
      const brand = doc.data()?.brand;
      if (brand && typeof brand === "string") {
        brandSet.add(brand);
      }
    });

    const brands = Array.from(brandSet).sort((a, b) =>
      a.localeCompare(b, "tr")
    );

    return NextResponse.json({ brands });
  } catch (error: any) {
    console.error("Brands GET error:", error);
    return NextResponse.json(
      { error: "Markalar yüklenemedi" },
      { status: 500 }
    );
  }
}
