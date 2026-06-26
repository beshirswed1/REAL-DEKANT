import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { rateLimit, getClientIp } from "@/lib/rate-limiter";

export async function POST(req: NextRequest) {
  // ─── Rate Limiting: max 3 messages per minute per IP ──────────────────────
  const clientIp = getClientIp(req.headers);
  const { limited } = rateLimit(`contact:${clientIp}`, 3, 60_000);
  if (limited) {
    return NextResponse.json(
      { error: "Çok fazla mesaj gönderdiniz. Lütfen bir dakika bekleyin." },
      { status: 429 }
    );
  }

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
