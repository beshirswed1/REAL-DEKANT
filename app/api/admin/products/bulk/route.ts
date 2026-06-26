/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
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

// ─── POST: Bulk action (publish / unpublish / delete) ─────────────────────────
export async function POST(req: NextRequest) {
  const isAdmin = await verifyAdmin(req);
  if (!isAdmin) {
    return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
  }

  try {
    const { action, ids } = await req.json();

    if (!action || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "Geçersiz istek" },
        { status: 400 }
      );
    }

    const batch = adminDb.batch();

    if (action === "publish") {
      for (const id of ids) {
        const ref = adminDb.collection("products").doc(id);
        batch.update(ref, {
          isPublished: true,
          updatedAt: FieldValue.serverTimestamp(),
        });
      }
    } else if (action === "unpublish") {
      for (const id of ids) {
        const ref = adminDb.collection("products").doc(id);
        batch.update(ref, {
          isPublished: false,
          updatedAt: FieldValue.serverTimestamp(),
        });
      }
    } else if (action === "delete") {
      for (const id of ids) {
        batch.delete(adminDb.collection("products").doc(id));
      }
    } else {
      return NextResponse.json(
        { error: "Geçersiz aksiyon" },
        { status: 400 }
      );
    }

    await batch.commit();

    return NextResponse.json({
      success: true,
      affected: ids.length,
    });
  } catch (error: any) {
    console.error("Bulk action error:", error);
    return NextResponse.json(
      { error: "Toplu işlem başarısız" },
      { status: 500 }
    );
  }
}
