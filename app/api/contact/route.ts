import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, subject, message } = body;

    if (!name || !message) {
      return NextResponse.json(
        { error: "Lütfen adınızı ve mesajınızı giriniz." },
        { status: 400 }
      );
    }

    // Save message to contactMessages collection
    const docRef = await adminDb.collection("contactMessages").add({
      name: String(name).trim(),
      subject: String(subject || "İletişim Mesajı").trim(),
      message: String(message).trim(),
      status: "unread",
      createdAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ success: true, id: docRef.id });
  } catch (error) {
    console.error("Contact message POST error:", error);
    return NextResponse.json(
      { error: "Mesaj gönderilirken bir hata oluştu." },
      { status: 500 }
    );
  }
}
