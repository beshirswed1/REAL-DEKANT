import type { Metadata } from "next";
import { Playfair_Display, Montserrat, Dancing_Script } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";
import { ReduxProvider } from "@/store/provider";
import RootLayoutWrapper from "@/components/layout/RootLayout";
import { adminDb } from "@/lib/firebase-admin";
import type { SiteConfig } from "@/components/admin/SettingsForm";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["400", "500", "600", "700"],
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  weight: ["300", "400", "500", "600", "700"],
});

const dancing = Dancing_Script({
  subsets: ["latin"],
  variable: "--font-dancing",
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://realdekant.com"),
  title: {
    default: "realdekant | Orijinal Parfüm Dekant Koleksiyonu",
    template: "%s | realdekant",
  },
  description:
    "realdekant — %100 orijinal marka parfümlerden steril koşullarda özenle hazırlanan lüks dekant (deneme boyu) koleksiyonu. Creed, Tom Ford, Dior, Chanel ve daha fazlası.",
  keywords: [
    "dekant",
    "parfüm",
    "perfume",
    "decant",
    "realdekant",
    "orijinal parfüm",
    "parfüm deneme boyu",
    "lüks parfüm",
    "niş parfüm",
    "real dekant",
    "tester parfüm",
    "Creed dekant",
    "Tom Ford dekant",
    "Chanel dekant",
    "Dior dekant",
    "parfüm örnekleri"
  ],
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: "https://realdekant.com",
    siteName: "realdekant",
    title: "realdekant | Orijinal Parfüm Dekant Koleksiyonu",
    description:
      "realdekant — %100 orijinal marka parfümlerden steril koşullarda hazırlanan lüks dekant (deneme boyu) koleksiyonu.",
    images: [
      {
        url: "/logo.png",
        width: 512,
        height: 512,
        alt: "realdekant Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "realdekant | Orijinal Parfüm Dekant Koleksiyonu",
    description:
      "realdekant — %100 orijinal marka parfümlerden hazırlanan lüks dekant (deneme boyu) koleksiyonu.",
    images: ["/logo.png"],
  },
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";
  const isAdmin = pathname.startsWith("/admin");

  let settingsConfig: SiteConfig | null = null;
  if (!isAdmin) {
    try {
      const docSnap = await adminDb.collection("settings").doc("config").get();
      if (docSnap.exists) {
        settingsConfig = JSON.parse(JSON.stringify(docSnap.data())) as SiteConfig;
      }
    } catch (error) {
      console.warn("Failed to fetch settings config in RootLayout:", error);
    }
  }

  return (
    <html lang="tr" dir="ltr">
      <body
        className={`${playfair.variable} ${montserrat.variable} ${dancing.variable} antialiased${isAdmin ? "" : " bg-cream-light text-charcoal"}`}
      >
        <ReduxProvider>
          {isAdmin ? (
            children
          ) : (
            <RootLayoutWrapper config={settingsConfig}>{children}</RootLayoutWrapper>
          )}
        </ReduxProvider>
      </body>
    </html>
  );
}
