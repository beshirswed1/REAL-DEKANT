import { adminDb } from "@/lib/firebase-admin";
import SettingsForm, { SiteConfig } from "@/components/admin/SettingsForm";

export const dynamic = "force-dynamic";

const DEFAULT_CONFIG: SiteConfig = {
  // Store
  freeShippingThreshold: 750,
  shippingFee: 50,
  codServiceFee: 40,
  maintenanceMode: false,
  // Contact
  contactPhone: "+90 500 000 00 00",
  contactWhatsapp: "905000000000",
  contactEmail: "info@realdekant.com",
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
  heroSlides: [],
  showBestSellers: true,
  showNewArrivals: true,
  showMenPerfumes: true,
  showBrandsMarquee: true,
  showWhyDekant: true,
  showFaq: true,
  // FAQ
  faqItems: [],
  // Why Dekant Content
  whyDekantTitle: "Neden Dekant Parfüm Tercih Edilmeli?",
  whyDekantDescription: "",
  whyDekantBenefits: [],
  whyDekantQuote: "Koku, görünmeyen imzandır.",
  // Content
  footerDescription: "Özenle seçilmiş, %100 orijinal marka parfümlerden hazırlanan lüks dekant (deneme boyu) koleksiyonu.",
  siteMotto: "Görünmez Ama Unutulmaz",
  // Legal
  privacyPolicy: "",
  termsOfUse: "",
};

export default async function AdminSettingsPage() {
  let config = { ...DEFAULT_CONFIG };

  try {
    const docSnap = await adminDb.collection("settings").doc("config").get();
    
    if (docSnap.exists) {
      const data = docSnap.data()!;
      
      // Merge database data with defaults, so new fields aren't undefined
      const mergedConfig: Record<string, unknown> = {};
      
      for (const [key, defaultValue] of Object.entries(DEFAULT_CONFIG)) {
        mergedConfig[key] = data[key] ?? defaultValue;
      }
      
      config = mergedConfig as unknown as SiteConfig;
    }
  } catch (err) {
    console.error("Failed to load settings config server-side:", err);
  }

  return <SettingsForm initialConfig={config} />;
}
