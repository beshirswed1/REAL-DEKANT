import { adminDb } from "@/lib/firebase-admin";
import type { SiteConfig } from "@/components/admin/SettingsForm";

// ─── In-memory settings cache ──────────────────────────────────────────────────
// Cache the settings config document in-memory to prevent hammering Firestore
// on every single page request wrapped in RootLayout.
let cachedSettings: SiteConfig | null = null;
let cacheTimestamp = 0;
let activeSettingsPromise: Promise<SiteConfig> | null = null;
const TTL_MS = 5 * 60 * 1000; // 5 minutes
const RETRY_COOLDOWN_MS = 30 * 1000; // 30 seconds

export const DEFAULT_SETTINGS: SiteConfig = {
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
  contactFacebook: "",
  contactTwitter: "",
  contactYouTube: "",
  contactMapsUrl: "",
  heroSlides: [],
  showBestSellers: true,
  showNewArrivals: true,
  showMenPerfumes: true,
  showBrandsMarquee: true,
  showWhyDekant: true,
  showFaq: true,
  faqItems: [],
  whyDekantTitle: "Neden Dekant Parfüm Tercih Edilmeli?",
  whyDekantDescription: "",
  whyDekantBenefits: [],
  whyDekantQuote: "Koku, görünmeyen imzandır.",
  footerDescription: "Özenle seçilmiş, %100 orijinal marka parfümlerden hazırlanan lüks dekant (deneme boyu) koleksiyonu.",
  siteMotto: "Görünmez Ama Unutulmaz",
  privacyPolicy: "",
  termsOfUse: "",
};

/**
 * Fetch settings configuration using Firebase Admin SDK (server-side only)
 * Results are cached in-memory for TTL_MS to handle concurrent traffic.
 * Uses promise-sharing to prevent cache stampedes and thundering herds.
 */
export async function getSettingsConfig(): Promise<SiteConfig> {
  const now = Date.now();

  // 1. Return cached data if still fresh
  if (cachedSettings && now - cacheTimestamp < TTL_MS) {
    return cachedSettings;
  }

  // 2. If there is already an active fetch in progress, reuse the same promise (prevents Cache Stampede)
  if (activeSettingsPromise) {
    return activeSettingsPromise;
  }

  // 3. Start new fetch and cache its promise (Thread-safe concurrency lock)
  activeSettingsPromise = (async () => {
    try {
      const docSnap = await adminDb.collection("settings").doc("config").get();

      if (!docSnap.exists) {
        // If config doc does not exist, return default settings
        cachedSettings = DEFAULT_SETTINGS;
        cacheTimestamp = Date.now();
        return DEFAULT_SETTINGS;
      }

      const data = docSnap.data() || {};
      
      // Normalize settings fields with fallbacks
      const config: SiteConfig = {
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
        contactFacebook: data.contactFacebook ?? DEFAULT_SETTINGS.contactFacebook,
        contactTwitter: data.contactTwitter ?? DEFAULT_SETTINGS.contactTwitter,
        contactYouTube: data.contactYouTube ?? DEFAULT_SETTINGS.contactYouTube,
        contactMapsUrl: data.contactMapsUrl ?? DEFAULT_SETTINGS.contactMapsUrl,
        heroSlides: data.heroSlides || [],
        faqItems: data.faqItems || [],
        showBestSellers: data.showBestSellers ?? DEFAULT_SETTINGS.showBestSellers,
        showNewArrivals: data.showNewArrivals ?? DEFAULT_SETTINGS.showNewArrivals,
        showMenPerfumes: data.showMenPerfumes ?? DEFAULT_SETTINGS.showMenPerfumes,
        showBrandsMarquee: data.showBrandsMarquee ?? DEFAULT_SETTINGS.showBrandsMarquee,
        showWhyDekant: data.showWhyDekant ?? DEFAULT_SETTINGS.showWhyDekant,
        showFaq: data.showFaq ?? DEFAULT_SETTINGS.showFaq,
        whyDekantTitle: data.whyDekantTitle ?? DEFAULT_SETTINGS.whyDekantTitle,
        whyDekantDescription: data.whyDekantDescription ?? DEFAULT_SETTINGS.whyDekantDescription,
        whyDekantBenefits: data.whyDekantBenefits ?? DEFAULT_SETTINGS.whyDekantBenefits,
        whyDekantQuote: data.whyDekantQuote ?? DEFAULT_SETTINGS.whyDekantQuote,
        footerDescription: data.footerDescription ?? DEFAULT_SETTINGS.footerDescription,
        siteMotto: data.siteMotto ?? DEFAULT_SETTINGS.siteMotto,
        privacyPolicy: data.privacyPolicy ?? DEFAULT_SETTINGS.privacyPolicy,
        termsOfUse: data.termsOfUse ?? DEFAULT_SETTINGS.termsOfUse,
      };

      // Update cache
      cachedSettings = config;
      cacheTimestamp = Date.now();

      return config;
    } catch (error) {
      console.warn("[settings-cache] Firestore fetch failed:", error);

      // Graceful Fallback with System Protection (Circuit Breaker Cooldown)
      // Set timestamp so we don't try to query Firestore again for RETRY_COOLDOWN_MS (30 seconds)
      cacheTimestamp = Date.now() - TTL_MS + RETRY_COOLDOWN_MS;

      if (cachedSettings) {
        console.warn("[settings-cache] Returning stale cached settings. Cooldown active for 30s.");
        return cachedSettings;
      }

      // If we don't have a cache yet, store default settings as a temporary cache
      // so other concurrent requests get this instantly without hitting the database.
      cachedSettings = DEFAULT_SETTINGS;
      return DEFAULT_SETTINGS;
    } finally {
      // Clear the active promise ref when done so next expired cycle can fetch again
      activeSettingsPromise = null;
    }
  })();

  return activeSettingsPromise;
}

/**
 * Force-clear the cache (should be called in admin settings update routes).
 */
export function invalidateSettingsCache(): void {
  cachedSettings = null;
  cacheTimestamp = 0;
  activeSettingsPromise = null;
}
