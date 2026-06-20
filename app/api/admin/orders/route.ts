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
    const { id, orderStatus, trackingNumber } = body;

    if (!id) {
      return NextResponse.json({ error: "ID gerekli" }, { status: 400 });
    }

    const updateData: any = {};
    if (orderStatus !== undefined) updateData.orderStatus = orderStatus;
    if (trackingNumber !== undefined) updateData.trackingNumber = trackingNumber;
    updateData.updatedAt = FieldValue.serverTimestamp();

    await adminDb.collection("orders").doc(id).update(updateData);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Order PUT error:", error);
    return NextResponse.json(
      { error: "Sipariş güncellenemedi: " + (error.message || "") },
      { status: 500 }
    );
  }
}
