import { getSettingsConfig } from "@/lib/settings-cache";
import ContactClient from "@/components/contact/ContactClient";

export const dynamic = "force-dynamic";

const DEFAULT_CONFIG = {
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

export const metadata = {
  title: "İletişim | realdekant",
  description: "Real Dekant iletişim bilgileri — adres, telefon, WhatsApp ve sosyal medya hesaplarımız.",
};

export default async function ContactPage() {
  let config = { ...DEFAULT_CONFIG };

  try {
    const data = await getSettingsConfig();
    config = {
      contactPhone: data.contactPhone ?? DEFAULT_CONFIG.contactPhone,
      contactWhatsapp: data.contactWhatsapp ?? DEFAULT_CONFIG.contactWhatsapp,
      contactEmail: data.contactEmail ?? DEFAULT_CONFIG.contactEmail,
      contactAddress: data.contactAddress ?? DEFAULT_CONFIG.contactAddress,
      contactWorkingHours: data.contactWorkingHours ?? DEFAULT_CONFIG.contactWorkingHours,
      contactInstagram: data.contactInstagram ?? DEFAULT_CONFIG.contactInstagram,
      contactTikTok: data.contactTikTok ?? DEFAULT_CONFIG.contactTikTok,
      contactSnapchat: data.contactSnapchat ?? DEFAULT_CONFIG.contactSnapchat,
      contactMapsUrl: data.contactMapsUrl ?? DEFAULT_CONFIG.contactMapsUrl,
    };
  } catch (err) {
    console.error("Failed to load settings config server-side for contact page:", err);
  }

  return <ContactClient config={config} />;
}
