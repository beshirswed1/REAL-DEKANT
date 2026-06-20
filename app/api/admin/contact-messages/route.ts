import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb, isMock } from "@/lib/firebase-admin";

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
  const isAdmin = isMock || (await verifyAdmin(req));
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id, action } = await req.json();

    if (!id || action !== "markRead") {
      return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 });
    }

    await adminDb.collection("contactMessages").doc(id).update({
      status: "read",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PUT /api/admin/contact-messages error:", error);
    return NextResponse.json(
      { error: "Mesaj güncellenirken bir hata oluştu" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const isAdmin = isMock || (await verifyAdmin(req));
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 });
    }

    await adminDb.collection("contactMessages").doc(id).delete();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/admin/contact-messages error:", error);
    return NextResponse.json(
      { error: "Mesaj silinirken bir hata oluştu" },
      { status: 500 }
    );
  }
}
