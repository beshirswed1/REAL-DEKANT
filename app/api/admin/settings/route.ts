/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb, isMock } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { invalidateSettingsCache } from "@/lib/settings-cache";

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

function sanitizeMapsUrl(input: string): string {
  if (!input) return "";
  const srcRegex = /src=["'](https:\/\/www\.google\.com\/maps\/embed\?[^"']+)["']/i;
  const match = input.match(srcRegex);
  if (match && match[1]) {
    return match[1];
  }
  if (input.startsWith("https://www.google.com/maps/embed?") || input.startsWith("https://www.google.com/maps/d/embed?")) {
    return input;
  }
  return "";
}

const DEFAULT_CONFIG = {
  // Store
  freeShippingThreshold: 750,
  shippingFee: 50,
  codServiceFee: 40,
  maintenanceMode: false,
  // Contact
  contactPhone: "+90 500 000 00 00",
  contactWhatsapp: "905000000000",
  contactAddress: "Nişantaşı, Şişli, İstanbul",
  contactWorkingHours: "Pazartesi - Cumartesi: 09:00 - 18:00",
  contactMapsUrl: "",
  // Social
  contactInstagram: "realdekant",
  contactTikTok: "",
  contactSnapchat: "",
  contactFacebook: "",
  contactTwitter: "",
  contactYouTube: "",
  // Homepage
  heroSlides: [] as any[],
  showBestSellers: true,
  showNewArrivals: true,
  showMenPerfumes: true,
  showBrandsMarquee: true,
  showWhyDekant: true,
  showFaq: true,
  // FAQ
  faqItems: [] as any[],
  // Why Dekant Content
  whyDekantTitle: "Neden Dekant Parfüm Tercih Edilmeli?",
  whyDekantDescription: "",
  whyDekantBenefits: [] as string[],
  whyDekantQuote: "Koku, görünmeyen imzandır.",
  // Content
  footerDescription: "Özenle seçilmiş, %100 orijinal marka parfümlerden hazırlanan lüks dekant (deneme boyu) koleksiyonu.",
  siteMotto: "Görünmez Ama Unutulmaz",
  // Legal
  privacyPolicy: "",
  termsOfUse: "",
};

// ─── GET: Fetch settings config ──────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const isAdmin = await verifyAdmin(req);
  if (!isAdmin) {
    return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
  }

  try {
    const docRef = adminDb.collection("settings").doc("config");
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return NextResponse.json(DEFAULT_CONFIG);
    }

    const data = docSnap.data()!;
    const response: Record<string, any> = {};

    // Map all fields, falling back to defaults
    for (const [key, defaultValue] of Object.entries(DEFAULT_CONFIG)) {
      response[key] = data[key] ?? defaultValue;
    }

    return NextResponse.json(response);
  } catch (error: any) {
    console.error("Settings GET error:", error);
    return NextResponse.json(
      { error: "Ayarlar yüklenemedi" },
      { status: 500 }
    );
  }
}

// ─── PUT: Update settings config (section-based) ─────────────────────────────
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
    const { section, ...fields } = body;

    const docRef = adminDb.collection("settings").doc("config");
    let updateData: Record<string, any> = { updatedAt: FieldValue.serverTimestamp() };

    switch (section) {
      case "store": {
        updateData = {
          ...updateData,
          freeShippingThreshold: parseFloat(fields.freeShippingThreshold) || DEFAULT_CONFIG.freeShippingThreshold,
          shippingFee: parseFloat(fields.shippingFee) || DEFAULT_CONFIG.shippingFee,
          codServiceFee: parseFloat(fields.codServiceFee) || DEFAULT_CONFIG.codServiceFee,
          maintenanceMode: !!fields.maintenanceMode,
        };
        break;
      }

      case "contact": {
        updateData = {
          ...updateData,
          contactPhone: String(fields.contactPhone || "").trim(),
          contactWhatsapp: String(fields.contactWhatsapp || "").trim().replace(/\+/g, "").replace(/\s/g, ""),
          contactAddress: String(fields.contactAddress || "").trim(),
          contactWorkingHours: String(fields.contactWorkingHours || "").trim(),
          contactMapsUrl: sanitizeMapsUrl(String(fields.contactMapsUrl || "").trim()),
        };
        break;
      }

      case "social": {
        updateData = {
          ...updateData,
          contactInstagram: String(fields.contactInstagram || "").trim(),
          contactTikTok: String(fields.contactTikTok || "").trim(),
          contactSnapchat: String(fields.contactSnapchat || "").trim(),
          contactFacebook: String(fields.contactFacebook || "").trim(),
          contactTwitter: String(fields.contactTwitter || "").trim(),
          contactYouTube: String(fields.contactYouTube || "").trim(),
        };
        break;
      }

      case "homepage": {
        // Validate and sanitize hero slides
        const heroSlides = Array.isArray(fields.heroSlides)
          ? fields.heroSlides.slice(0, 6).map((slide: any) => ({
              image: String(slide.image || "").trim(),
              label: String(slide.label || "").trim(),
              headline: String(slide.headline || "").trim(),
              subtitle: String(slide.subtitle || "").trim(),
              ctaText: String(slide.ctaText || "").trim(),
              ctaLink: String(slide.ctaLink || "/shop").trim(),
            }))
          : [];

        // Validate and sanitize benefits
        const benefits = Array.isArray(fields.whyDekantBenefits)
          ? fields.whyDekantBenefits.slice(0, 6).map((b: any) => String(b || "").trim()).filter(Boolean)
          : [];

        // Validate and sanitize FAQ items
        const faqItems = Array.isArray(fields.faqItems)
          ? fields.faqItems.slice(0, 15).map((item: any) => ({
              question: String(item.question || "").trim(),
              answer: String(item.answer || "").trim(),
            })).filter((item: any) => item.question || item.answer)
          : [];

        updateData = {
          ...updateData,
          heroSlides,
          showBestSellers: !!fields.showBestSellers,
          showNewArrivals: !!fields.showNewArrivals,
          showMenPerfumes: !!fields.showMenPerfumes,
          showBrandsMarquee: !!fields.showBrandsMarquee,
          showWhyDekant: !!fields.showWhyDekant,
          showFaq: !!fields.showFaq,
          faqItems,
          whyDekantTitle: String(fields.whyDekantTitle || "").trim(),
          whyDekantDescription: String(fields.whyDekantDescription || "").trim(),
          whyDekantBenefits: benefits,
          whyDekantQuote: String(fields.whyDekantQuote || "").trim(),
        };
        break;
      }

      case "content": {
        updateData = {
          ...updateData,
          footerDescription: String(fields.footerDescription || "").trim(),
          siteMotto: String(fields.siteMotto || "").trim(),
        };
        break;
      }

      case "legal": {
        updateData = {
          ...updateData,
          privacyPolicy: String(fields.privacyPolicy || "").trim(),
          termsOfUse: String(fields.termsOfUse || "").trim(),
        };
        break;
      }

      default: {
        // Legacy: support old-style full save for backward compatibility
        updateData = {
          ...updateData,
          freeShippingThreshold: parseFloat(fields.freeShippingThreshold) || DEFAULT_CONFIG.freeShippingThreshold,
          shippingFee: parseFloat(fields.shippingFee) || DEFAULT_CONFIG.shippingFee,
          codServiceFee: parseFloat(fields.codServiceFee) || DEFAULT_CONFIG.codServiceFee,
          maintenanceMode: !!fields.maintenanceMode,
          contactPhone: String(fields.contactPhone || "").trim(),
          contactWhatsapp: String(fields.contactWhatsapp || "").trim().replace(/\+/g, "").replace(/\s/g, ""),
          contactAddress: String(fields.contactAddress || "").trim(),
          contactWorkingHours: String(fields.contactWorkingHours || "").trim(),
          contactMapsUrl: sanitizeMapsUrl(String(fields.contactMapsUrl || "").trim()),
          contactInstagram: String(fields.contactInstagram || "").trim(),
          contactTikTok: String(fields.contactTikTok || "").trim(),
          contactSnapchat: String(fields.contactSnapchat || "").trim(),
        };
        break;
      }
    }

    await docRef.set(updateData, { merge: true });

    // Invalidate the settings cache so next visitor loads updated configuration
    invalidateSettingsCache();

    return NextResponse.json({ success: true, section: section || "all" });
  } catch (error: any) {
    console.error("Settings PUT error:", error);
    return NextResponse.json(
      { error: "Ayarlar güncellenemedi: " + (error.message || "") },
      { status: 500 }
    );
  }
}
