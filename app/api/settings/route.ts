import { NextResponse } from "next/server";
import { getSettingsConfig, DEFAULT_SETTINGS } from "@/lib/settings-cache";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getSettingsConfig();
    return NextResponse.json({
      freeShippingThreshold: data.freeShippingThreshold ?? DEFAULT_SETTINGS.freeShippingThreshold,
      shippingFee: data.shippingFee ?? DEFAULT_SETTINGS.shippingFee,
      codServiceFee: data.codServiceFee ?? DEFAULT_SETTINGS.codServiceFee,
      maintenanceMode: data.maintenanceMode ?? DEFAULT_SETTINGS.maintenanceMode,
      contactPhone: data.contactPhone ?? DEFAULT_SETTINGS.contactPhone,
      contactWhatsapp: data.contactWhatsapp ?? DEFAULT_SETTINGS.contactWhatsapp,
      contactEmail: data.contactEmail ?? DEFAULT_SETTINGS.contactEmail,
      contactAddress: data.contactAddress ?? DEFAULT_SETTINGS.contactAddress,
      contactWorkingHours: data.contactWorkingHours ?? DEFAULT_SETTINGS.contactWorkingHours,
      contactInstagram: data.contactInstagram ?? DEFAULT_SETTINGS.contactInstagram,
      contactTikTok: data.contactTikTok ?? DEFAULT_SETTINGS.contactTikTok,
      contactSnapchat: data.contactSnapchat ?? DEFAULT_SETTINGS.contactSnapchat,
      contactMapsUrl: data.contactMapsUrl ?? DEFAULT_SETTINGS.contactMapsUrl,
    });
  } catch (error) {
    console.error("Public settings GET error:", error);
    return NextResponse.json(DEFAULT_SETTINGS);
  }
}
