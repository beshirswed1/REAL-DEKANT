import React from "react";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ana Sayfa | realdekant | Orijinal Parfüm Dekant Koleksiyonu",
  description: "Creed, Tom Ford, Dior ve Chanel gibi seçkin niş parfümlerden steril koşullarda özenle hazırlanan %100 orijinal lüks dekant (deneme boyu) koleksiyonu.",
  alternates: {
    canonical: "/",
  },
};

// Enable ISR caching (1 hour)
export const revalidate = 3600;
import ProductCard from "@/components/product/ProductCard";
import HeroCarousel from "@/components/home/HeroCarousel";
import BrandsMarquee from "@/components/home/BrandsMarquee";
import FaqSection from "@/components/home/FaqSection";
import { getPublishedProducts } from "@/lib/product-cache";
import type { Product } from "@/types";
import { Timestamp } from "firebase/firestore";
import { getSettingsConfig } from "@/lib/settings-cache";
import type { SiteConfig } from "@/components/admin/SettingsForm";
import type { FaqItem } from "@/components/admin/SettingsForm";


// ─── Mock Products Fallback ──────────────────────────────────────────────────
const MOCK_PRODUCTS: Product[] = [
  {
    id: "aventus",
    sku: "CRE-AVE",
    brand: "Creed",
    perfumeName: "Aventus",
    slug: "creed-aventus",
    gender: "male",
    concentration: "EDP",
    prices: { "3ml": 180, "5ml": 290, "10ml": 550 },
    availability: "in_stock",
    scentFamily: ["Fruity", "Chypre"],
    notes: { top: ["Pineapple", "Bergamot"], heart: ["Birch", "Patchouli"], base: ["Musk", "Oakmoss"] },
    longevity: "Güçlü",
    sillage: "Güçlü",
    season: ["Spring", "Summer"],
    timeOfDay: ["Gündüz"],
    images: [{ url: "https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=600&auto=format&fit=crop", publicId: "", alt: "Creed Aventus" }],
    isPublished: true,
    isFeatured: true,
    isNew: false,
    soldCount: 450,
    stock: 15,
    tags: ["niche", "classic"],
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  },
  {
    id: "bleu",
    sku: "CHA-BLEU",
    brand: "Chanel",
    perfumeName: "Bleu de Chanel",
    slug: "chanel-bleu-de-chanel",
    gender: "male",
    concentration: "EDP",
    prices: { "3ml": 150, "5ml": 240, "10ml": 460 },
    availability: "in_stock",
    scentFamily: ["Woody", "Aromatic"],
    notes: { top: ["Grapefruit", "Lemon"], heart: ["Ginger", "Mint"], base: ["Incense", "Cedar"] },
    longevity: "Orta",
    sillage: "Orta",
    season: ["Autumn", "Winter"],
    timeOfDay: ["Her Zaman"],
    images: [{ url: "https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=600&auto=format&fit=crop", publicId: "", alt: "Bleu de Chanel" }],
    isPublished: true,
    isFeatured: true,
    isNew: true,
    soldCount: 380,
    stock: 25,
    tags: ["popular", "fresh"],
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  },
  {
    id: "lostcherry",
    sku: "TF-LOST",
    brand: "Tom Ford",
    perfumeName: "Lost Cherry",
    slug: "tom-ford-lost-cherry",
    gender: "unisex",
    concentration: "EDP",
    prices: { "3ml": 260, "5ml": 420, "10ml": 810 },
    availability: "in_stock",
    scentFamily: ["Amber", "Floral"],
    notes: { top: ["Sour Cherry", "Bitter Almond"], heart: ["Plum", "Turkish Rose"], base: ["Tonka Bean", "Vanilla"] },
    longevity: "Orta",
    sillage: "Orta",
    season: ["Autumn", "Winter"],
    timeOfDay: ["Gece"],
    images: [{ url: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?q=80&w=600&auto=format&fit=crop", publicId: "", alt: "Tom Ford Lost Cherry" }],
    isPublished: true,
    isFeatured: true,
    isNew: true,
    soldCount: 290,
    stock: 8,
    tags: ["niche", "sweet"],
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  },
  {
    id: "grisdior",
    sku: "DIOR-GRIS",
    brand: "Dior",
    perfumeName: "Gris Dior",
    slug: "dior-gris-dior",
    gender: "unisex",
    concentration: "EDP",
    prices: { "3ml": 190, "5ml": 310, "10ml": 590 },
    availability: "in_stock",
    scentFamily: ["Chypre", "Floral"],
    notes: { top: ["Bergamot"], heart: ["Rose", "Jasmine"], base: ["Patchouli", "Moss", "Amber"] },
    longevity: "Güçlü",
    sillage: "Orta",
    season: ["Spring", "Autumn"],
    timeOfDay: ["Her Zaman"],
    images: [{ url: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=600&auto=format&fit=crop", publicId: "", alt: "Gris Dior" }],
    isPublished: true,
    isFeatured: false,
    isNew: true,
    soldCount: 150,
    stock: 12,
    tags: ["luxury", "chic"],
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  },
  {
    id: "greenirish",
    sku: "CRE-GIT",
    brand: "Creed",
    perfumeName: "Green Irish Tweed",
    slug: "creed-green-irish-tweed",
    gender: "male",
    concentration: "EDP",
    prices: { "3ml": 175, "5ml": 285, "10ml": 540 },
    availability: "in_stock",
    scentFamily: ["Fougere"],
    notes: { top: ["Lemon Verbena", "Iris"], heart: ["Violet Leaf"], base: ["Ambergris", "Sandalwood"] },
    longevity: "Güçlü",
    sillage: "Orta",
    season: ["Spring", "Summer"],
    timeOfDay: ["Gündüz"],
    images: [{ url: "https://images.unsplash.com/photo-1547887537-6158d64c35b3?q=80&w=600&auto=format&fit=crop", publicId: "", alt: "Green Irish Tweed" }],
    isPublished: true,
    isFeatured: false,
    isNew: false,
    soldCount: 310,
    stock: 20,
    tags: ["classic", "green"],
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  }
];

export default async function HomePage() {
  let products: Product[] = [];
  let settingsConfig: SiteConfig | null = null;
  
  try {
    const [productsRes, configRes] = await Promise.allSettled([
      getPublishedProducts(),
      getSettingsConfig()
    ]);

    if (productsRes.status === "fulfilled") {
      products = productsRes.value;
    } else {
      console.warn("Product cache fetch failed:", productsRes.reason);
    }

    if (configRes.status === "fulfilled") {
      settingsConfig = configRes.value;
    } else {
      console.warn("Settings config cache fetch failed:", configRes.reason);
    }
  } catch (error) {
    console.warn("Error fetching data:", error);
  }

  // Fallback to mock data if Firestore has 0 published products
  if (products.length === 0) {
    products = MOCK_PRODUCTS;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const serializeTimestamp = (ts: any) => {
    if (!ts) return null;
    if (typeof ts.toDate === "function") {
      return { seconds: ts.seconds, nanoseconds: ts.nanoseconds };
    }
    return ts;
  };

  const serializedProducts = products.map((p) => {
    const obj = {
      ...p,
      createdAt: serializeTimestamp(p.createdAt),
      updatedAt: serializeTimestamp(p.updatedAt),
      newUntil: serializeTimestamp(p.newUntil),
    };
    return JSON.parse(JSON.stringify(obj));
  });

  // Segmenting products
  const bestSellers = [...serializedProducts]
    .sort((a, b) => b.soldCount - a.soldCount)
    .slice(0, 4);
  const newArrivals = serializedProducts.filter((p) => p.isNew).slice(0, 4);
  const menPerfumes = serializedProducts.filter((p) => p.gender === "male").slice(0, 4);

  const brandLogos = [
    "Chanel",
    "Dior",
    "Tom Ford",
    "Creed",
    "Versace",
    "Byredo",
    "Kilian",
    "Le Labo",
    "Memo Paris",
    "Initio",
    "Parfums de Marly",
    "Xerjoff",
  ];

  const getGridClassName = (count: number) => {
    if (count === 1) {
      return "flex justify-center max-w-[300px] mx-auto";
    }
    if (count === 2) {
      return "grid grid-cols-2 gap-5 lg:gap-6 max-w-2xl mx-auto";
    }
    if (count === 3) {
      return "grid grid-cols-2 md:grid-cols-3 gap-5 lg:gap-6 max-w-4xl mx-auto";
    }
    return "grid grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6 max-w-6xl mx-auto";
  };

  return (
    <div className="flex flex-col bg-[#FAF7F0] text-[#1A1A1A] min-h-screen overflow-x-hidden">
      
      {/* 1. HERO CAROUSEL */}
      <HeroCarousel slidesData={settingsConfig?.heroSlides} />

      {/* 2. BEST SELLERS SECTION */}
      {settingsConfig?.showBestSellers !== false && bestSellers.length > 0 && (
        <section id="best-sellers" className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-10 sm:py-14 md:py-20">
          <div className="text-center space-y-2 mb-10 sm:mb-12">
            <span className="font-montserrat text-[10px] tracking-[0.3em] text-[#C9A84C] uppercase font-bold">
              Çok Satanlar
            </span>
            <h2 className="font-playfair text-2xl sm:text-3xl font-bold tracking-wide uppercase text-charcoal">
              En Çok Tercih Edilenler
            </h2>
            <div className="flex justify-center items-center gap-2 mt-3">
              <div className="h-[1px] w-8 bg-[#C9A84C]/45" />
              <div className="w-1.5 h-1.5 rounded-full bg-[#C9A84C]" />
              <div className="h-[1px] w-8 bg-[#C9A84C]/45" />
            </div>
          </div>

          <div className={getGridClassName(bestSellers.length)}>
            {bestSellers.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="text-center mt-10">
            <Link
              href="/shop"
              className="btn-luxury-outline px-8 py-3.5 text-[10px] tracking-[0.2em]"
            >
              Tüm Ürünleri Gör
            </Link>
          </div>
        </section>
      )}

      {/* 3. NEW ARRIVALS SECTION */}
      {settingsConfig?.showNewArrivals !== false && newArrivals.length > 0 && (
        <section className="bg-white border-y border-[#C9A84C]/10 py-14 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-2 mb-10 sm:mb-12">
              <span className="font-montserrat text-[10px] tracking-[0.3em] text-[#C9A84C] uppercase font-bold">
                Yeni Keşifler
              </span>
              <h2 className="font-playfair text-2xl sm:text-3xl font-bold tracking-wide uppercase text-charcoal">
                Yeni Gelenler
              </h2>
              <div className="flex justify-center items-center gap-2 mt-3">
                <div className="h-[1px] w-8 bg-[#C9A84C]/45" />
                <div className="w-1.5 h-1.5 rounded-full bg-[#C9A84C]" />
                <div className="h-[1px] w-8 bg-[#C9A84C]/45" />
              </div>
            </div>

            <div className={getGridClassName(newArrivals.length)}>
              {newArrivals.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 4. MEN'S PERFUMES SECTION */}
      {settingsConfig?.showMenPerfumes !== false && menPerfumes.length > 0 && (
        <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-10 sm:py-14 md:py-20">
          <div className="text-center space-y-2 mb-10 sm:mb-12">
            <span className="font-montserrat text-[10px] tracking-[0.3em] text-[#C9A84C] uppercase font-bold">
              Erkek Koleksiyonu
            </span>
            <h2 className="font-playfair text-2xl sm:text-3xl font-bold tracking-wide uppercase text-charcoal">
              Erkek Parfümleri
            </h2>
            <div className="flex justify-center items-center gap-2 mt-3">
              <div className="h-[1px] w-8 bg-[#C9A84C]/45" />
              <div className="w-1.5 h-1.5 rounded-full bg-[#C9A84C]" />
              <div className="h-[1px] w-8 bg-[#C9A84C]/45" />
            </div>
          </div>

          <div className={getGridClassName(menPerfumes.length)}>
            {menPerfumes.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* 5. BRAND LOGOS — Infinite Marquee */}
      {settingsConfig?.showBrandsMarquee !== false && (
        <BrandsMarquee brands={brandLogos} />
      )}

      {/* 6. NEDEN DEKANT PARFÜM? — Redesigned Section */}
      {settingsConfig?.showWhyDekant !== false && (
        <section className="bg-[#0D0D0D] border-t border-[#C9A84C]/15 text-[#F8F3E8] py-14 sm:py-20 md:py-28 relative overflow-hidden">
          {/* Subtle radial glow */}
          <div className="absolute inset-0 opacity-[0.04] pointer-events-none bg-[radial-gradient(circle_at_bottom_right,_var(--tw-gradient-stops))] from-[#C9A84C] via-transparent to-transparent" />
        
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-20 items-center">
            
            {/* Left: Text Content */}
            <div className="space-y-7 order-2 lg:order-1">
              {/* Section Label */}
              <div className="flex items-center space-x-3">
                <div className="w-1 h-8 bg-[#C9A84C] rounded-full" />
                <span className="font-montserrat text-[10px] tracking-[0.3em] text-[#C9A84C] uppercase font-bold">
                  Dekant Nedir?
                </span>
              </div>

              {/* Headline */}
              <h2 className="font-playfair text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold tracking-wide uppercase text-[#F8F3E8] leading-tight">
                {settingsConfig?.whyDekantTitle || "Neden Dekant Parfüm Tercih Edilmeli?"}
              </h2>

              {/* Main Description */}
              <div className="space-y-4 font-montserrat text-[13px] tracking-wide text-[#FAF7F0]/70 leading-[1.85] whitespace-pre-line">
                <p>
                  {settingsConfig?.whyDekantDescription ||
                    "Dekant parfüm, orijinal büyük boy parfüm şişelerinden steril, sızdırmaz ve taşınabilir küçük şişelere aktarılarak hazırlanan orijinal parfüm örnekleridir. Bu yöntem sayesinde parfüm tutkunları, yüksek fiyatlara sahip designer ve niche kokuları çok daha uygun maliyetle deneme fırsatı bulur.\n\nReal Dekant olarak tüm dekantlarımızı %100 orijinal parfümlerden, hijyenik koşullarımızda ve özenle hazırlıyoruz."}
                </p>
              </div>

              {/* Benefits List */}
              <div className="space-y-3 pt-2">
                {(settingsConfig?.whyDekantBenefits?.length
                  ? settingsConfig.whyDekantBenefits
                  : [
                      "Dilediğiniz pahalı kokuyu çok daha ekonomik bir şekilde test edin.",
                      "Hafif ve sızdırmaz şişelerle seyahat ve çanta konforunu yaşayın.",
                      "Orijinalliğin güvencesiyle ekonomik, güvenli ve özgür bir keşif deneyimi.",
                    ]
                ).map((benefit, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-[#C9A84C]/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <p className="font-montserrat text-[12px] text-[#FAF7F0]/65 leading-relaxed">
                      {benefit}
                    </p>
                  </div>
                ))}
              </div>

              {/* Quote */}
              <div className="pt-4 border-t border-[#C9A84C]/15 space-y-1.5">
                <p className="font-dancing text-2xl text-[#C9A84C] italic">
                  &ldquo;{settingsConfig?.whyDekantQuote || "Koku, görünmeyen imzandır."}&rdquo;
                </p>
                <p className="font-montserrat text-[9px] tracking-[0.2em] text-[#F8F3E8]/30 uppercase">
                  REAL DEKANT ATELIER
                </p>
              </div>
            </div>

            {/* Right: Image */}
            <div className="relative order-1 lg:order-2 flex justify-center lg:justify-end">
              <div className="relative w-full max-w-md lg:max-w-lg animate-float">
                {/* Gold border frame */}
                <div className="absolute -inset-3 border border-[#C9A84C]/20 rounded-2xl pointer-events-none" />
                <div className="absolute -inset-6 border border-[#C9A84C]/8 rounded-3xl pointer-events-none" />
                
                {/* Image */}
                <div className="relative aspect-[4/5] rounded-xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.4)]">
                  <Image
                    src="/images/dekan.png"
                    alt="Real Dekant - Dekant Parfüm Koleksiyonu"
                    fill
                    sizes="(max-width: 1024px) 90vw, 40vw"
                    className="object-cover"
                  />
                  {/* Subtle gold gradient overlay at bottom */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0D]/30 via-transparent to-transparent" />
                </div>

                {/* Floating accent badge */}
                <div className="absolute -bottom-4 -left-4 sm:-bottom-6 sm:-left-6 bg-[#C9A84C] text-[#0D0D0D] py-3 px-5 rounded-xl shadow-lg">
                  <p className="font-playfair text-base sm:text-lg font-bold leading-none">%100</p>
                  <p className="font-montserrat text-[8px] tracking-[0.2em] uppercase mt-0.5">Orijinal</p>
                </div>
              </div>
            </div>

          </div>
        </div>
        </section>
      )}

      {/* 7. FAQ SECTION */}
      {settingsConfig?.showFaq !== false && settingsConfig?.faqItems && settingsConfig.faqItems.length > 0 && (
        <FaqSection items={settingsConfig.faqItems as FaqItem[]} />
      )}

    </div>
  );
}
