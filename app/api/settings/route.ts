import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export const dynamic = "force-dynamic";

const DEFAULT_CONFIG = {
  freeShippingThreshold: 750,
  shippingFee: 50,
  codServiceFee: 40,
  maintenanceMode: false,
  contactPhone: "+90 500 000 00 00",
  contactWhatsapp: "905000000000",
  contactEmail: "info@realdekant.com",
  contactAddress: "Nişantaşı, Şişli, İstanbul",
  contactWorkingHours: "Pazartesi - Cumartesi: 09:00 - 18:00",
  contactInstagram: "realdekant",
  contactTikTok: "",
  contactSnapchat: "",
  contactMapsUrl: "",
};

export async function GET() {
  try {
    const docRef = adminDb.collection("settings").doc("config");
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return NextResponse.json(DEFAULT_CONFIG);
    }

    const data = docSnap.data()!;
    return NextResponse.json({
      freeShippingThreshold: data.freeShippingThreshold ?? DEFAULT_CONFIG.freeShippingThreshold,
      shippingFee: data.shippingFee ?? DEFAULT_CONFIG.shippingFee,
      codServiceFee: data.codServiceFee ?? DEFAULT_CONFIG.codServiceFee,
      maintenanceMode: data.maintenanceMode ?? DEFAULT_CONFIG.maintenanceMode,
      contactPhone: data.contactPhone ?? DEFAULT_CONFIG.contactPhone,
      contactWhatsapp: data.contactWhatsapp ?? DEFAULT_CONFIG.contactWhatsapp,
      contactEmail: data.contactEmail ?? DEFAULT_CONFIG.contactEmail,
      contactAddress: data.contactAddress ?? DEFAULT_CONFIG.contactAddress,
      contactWorkingHours: data.contactWorkingHours ?? DEFAULT_CONFIG.contactWorkingHours,
      contactInstagram: data.contactInstagram ?? DEFAULT_CONFIG.contactInstagram,
      contactTikTok: data.contactTikTok ?? DEFAULT_CONFIG.contactTikTok,
      contactSnapchat: data.contactSnapchat ?? DEFAULT_CONFIG.contactSnapchat,
      contactMapsUrl: data.contactMapsUrl ?? DEFAULT_CONFIG.contactMapsUrl,
    });
  } catch (error) {
    console.error("Public settings GET error:", error);
    return NextResponse.json(DEFAULT_CONFIG);
  }
}
