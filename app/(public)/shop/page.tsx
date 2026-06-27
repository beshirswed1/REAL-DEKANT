import React from "react";
import type { Metadata } from "next";
import { getPublishedProducts } from "@/lib/product-cache";
import type { Product } from "@/types";
import { Timestamp } from "firebase/firestore";
import ProductGrid from "@/components/product/ProductGrid";

export const metadata: Metadata = {
  title: "Katalog | Tüm Parfümler | realdekant",
  description: "Orijinal designer ve niş parfümlerin steril dekant (deneme boyu) koleksiyonu. 3ml, 5ml ve 10ml boyut seçenekleriyle tüm parfümleri keşfedin.",
  alternates: {
    canonical: "/shop",
  },
};

// Enable ISR caching (1 hour)
export const revalidate = 3600;

// ─── Mock Products Fallback (Extended Catalog for pagination demo) ───────────
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
    scentFamily: ["Fresh", "Oryantal"],
    notes: { top: ["Pineapple", "Bergamot"], heart: ["Birch", "Patchouli"], base: ["Musk", "Oakmoss"] },
    longevity: "Güçlü",
    sillage: "Güçlü",
    season: ["İlkbahar", "Yaz"],
    timeOfDay: ["Gündüz"],
    images: [{ url: "https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=600&auto=format&fit=crop", publicId: "", alt: "Creed Aventus" }],
    isPublished: true,
    isFeatured: true,
    isNew: false,
    soldCount: 450,
    stock: 10,
    tags: ["niche", "classic"],
    createdAt: Timestamp.fromDate(new Date("2026-01-01")),
    updatedAt: Timestamp.now()
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
    scentFamily: ["Odunsu", "Fresh"],
    notes: { top: ["Grapefruit", "Lemon"], heart: ["Ginger", "Mint"], base: ["Incense", "Cedar"] },
    longevity: "Orta",
    sillage: "Orta",
    season: ["İlkbahar", "Sonbahar", "Yaz"],
    timeOfDay: ["Her Zaman"],
    images: [{ url: "https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=600&auto=format&fit=crop", publicId: "", alt: "Bleu de Chanel" }],
    isPublished: true,
    isFeatured: true,
    isNew: true,
    soldCount: 380,
    stock: 25,
    tags: ["popular", "fresh"],
    createdAt: Timestamp.fromDate(new Date("2026-05-01")),
    updatedAt: Timestamp.now()
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
    scentFamily: ["Oryantal", "Gourmand"],
    notes: { top: ["Sour Cherry", "Bitter Almond"], heart: ["Plum", "Turkish Rose"], base: ["Tonka Bean", "Vanilla"] },
    longevity: "Orta",
    sillage: "Orta",
    season: ["Sonbahar", "Kış"],
    timeOfDay: ["Gece"],
    images: [{ url: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?q=80&w=600&auto=format&fit=crop", publicId: "", alt: "Tom Ford Lost Cherry" }],
    isPublished: true,
    isFeatured: true,
    isNew: true,
    soldCount: 290,
    stock: 7,
    tags: ["niche", "sweet"],
    createdAt: Timestamp.fromDate(new Date("2026-05-15")),
    updatedAt: Timestamp.now()
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
    scentFamily: ["Çiçeksi", "Odunsu"],
    notes: { top: ["Bergamot"], heart: ["Rose", "Jasmine"], base: ["Patchouli", "Moss", "Amber"] },
    longevity: "Güçlü",
    sillage: "Orta",
    season: ["İlkbahar", "Sonbahar"],
    timeOfDay: ["Her Zaman"],
    images: [{ url: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=600&auto=format&fit=crop", publicId: "", alt: "Gris Dior" }],
    isPublished: true,
    isFeatured: false,
    isNew: true,
    soldCount: 150,
    stock: 15,
    tags: ["luxury", "chic"],
    createdAt: Timestamp.fromDate(new Date("2026-06-01")),
    updatedAt: Timestamp.now()
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
    scentFamily: ["Fresh", "Odunsu"],
    notes: { top: ["Lemon Verbena", "Iris"], heart: ["Violet Leaf"], base: ["Ambergris", "Sandalwood"] },
    longevity: "Güçlü",
    sillage: "Orta",
    season: ["İlkbahar", "Yaz"],
    timeOfDay: ["Gündüz"],
    images: [{ url: "https://images.unsplash.com/photo-1547887537-6158d64c35b3?q=80&w=600&auto=format&fit=crop", publicId: "", alt: "Green Irish Tweed" }],
    isPublished: true,
    isFeatured: false,
    isNew: false,
    soldCount: 310,
    stock: 20,
    tags: ["classic", "green"],
    createdAt: Timestamp.fromDate(new Date("2025-10-01")),
    updatedAt: Timestamp.now()
  },
  {
    id: "savage",
    sku: "DIOR-SAV",
    brand: "Dior",
    perfumeName: "Sauvage",
    slug: "dior-sauvage",
    gender: "male",
    concentration: "EDT",
    prices: { "3ml": 140, "5ml": 220, "10ml": 410 },
    availability: "in_stock",
    scentFamily: ["Baharatlı", "Fresh"],
    notes: { top: ["Pepper", "Bergamot"], heart: ["Lavender", "Patchouli"], base: ["Cedar", "Ambroxan"] },
    longevity: "Canavar",
    sillage: "Güçlü",
    season: ["Yaz", "Sonbahar", "İlkbahar"],
    timeOfDay: ["Her Zaman"],
    images: [{ url: "https://images.unsplash.com/photo-1508746829417-e6f548d8d6ed?q=80&w=600&auto=format&fit=crop", publicId: "", alt: "Dior Sauvage" }],
    isPublished: true,
    isFeatured: false,
    isNew: false,
    soldCount: 520,
    stock: 30,
    tags: ["popular"],
    createdAt: Timestamp.fromDate(new Date("2025-05-01")),
    updatedAt: Timestamp.now()
  },
  {
    id: "bacarat",
    sku: "MFK-BAC",
    brand: "Maison Francis Kurkdjian",
    perfumeName: "Baccarat Rouge 540",
    slug: "maison-francis-kurkdjian-baccarat-rouge-540",
    gender: "unisex",
    concentration: "EDP",
    prices: { "3ml": 280, "5ml": 460, "10ml": 890 },
    availability: "limited",
    scentFamily: ["Oryantal", "Çiçeksi"],
    notes: { top: ["Jasmine", "Saffron"], heart: ["Amberwood", "Ambergris"], base: ["Fir Resin", "Cedar"] },
    longevity: "Canavar",
    sillage: "Yoğun",
    season: ["Sonbahar", "Kış"],
    timeOfDay: ["Gece"],
    images: [{ url: "https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?q=80&w=600&auto=format&fit=crop", publicId: "", alt: "Baccarat Rouge 540" }],
    isPublished: true,
    isFeatured: true,
    isNew: false,
    soldCount: 490,
    stock: 4,
    tags: ["hype", "sweet"],
    createdAt: Timestamp.fromDate(new Date("2025-12-01")),
    updatedAt: Timestamp.now()
  },
  {
    id: "woodsage",
    sku: "JM-WOOD",
    brand: "Jo Malone",
    perfumeName: "Wood Sage & Sea Salt",
    slug: "jo-malone-wood-sage-sea-salt",
    gender: "unisex",
    concentration: "EDC",
    prices: { "3ml": 130, "5ml": 200, "10ml": 380 },
    availability: "in_stock",
    scentFamily: ["Fresh", "Odunsu"],
    notes: { top: ["Ambrette Seeds"], heart: ["Sea Salt"], base: ["Sage"] },
    longevity: "Zayıf",
    sillage: "Hafif",
    season: ["Yaz", "İlkbahar"],
    timeOfDay: ["Gündüz"],
    images: [{ url: "https://images.unsplash.com/photo-1528740564264-7a918b93f6cd?q=80&w=600&auto=format&fit=crop", publicId: "", alt: "Wood Sage & Sea Salt" }],
    isPublished: true,
    isFeatured: false,
    isNew: false,
    soldCount: 220,
    stock: 18,
    tags: ["fresh", "clean"],
    createdAt: Timestamp.fromDate(new Date("2026-02-01")),
    updatedAt: Timestamp.now()
  }
];

export default async function ShopPage() {

  // ── Fetch ALL published products using Admin SDK + in-memory cache ─────────
  // Filtering, sorting, and pagination are handled client-side in ProductGrid.
  let products: Product[] = [];
  try {
    products = await getPublishedProducts();
  } catch (error) {
    console.warn("Product cache fetch failed in shop page, using mock catalog fallback:", error);
  }

  if (products.length === 0) {
    products = MOCK_PRODUCTS;
  }

  // Products from cache are already serialized (plain objects),
  // but mock products may have Timestamp instances — normalize them.
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


  return (
    <div className="bg-cream-light min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Luxury Hero Banner */}
        <div className="w-full bg-[#111] text-cream-light relative overflow-hidden mb-12 flex flex-col items-center justify-center py-16 sm:py-24 px-4 shadow-[inset_0_0_50px_rgba(0,0,0,0.5)]">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#C9A84C] via-[#111] to-[#111]" />
          
          <div className="relative z-10 text-center flex flex-col items-center space-y-4">
            <span className="font-montserrat text-[10px] sm:text-xs tracking-[0.4em] text-[#C9A84C] uppercase">
              Benzersiz Kokuları Keşfedin
            </span>
            <h1 className="font-playfair text-4xl sm:text-5xl md:text-6xl font-bold tracking-[0.1em] uppercase text-white drop-shadow-lg">
              Parfüm Kataloğu
            </h1>
            <div className="flex items-center gap-3 pt-2">
              <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-[#C9A84C]" />
              <div className="w-1.5 h-1.5 rotate-45 bg-[#C9A84C]" />
              <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-[#C9A84C]" />
            </div>
          </div>
        </div>

        {/* Catalog layout: ProductGrid handles filters sidebar + grid internally */}
        <ProductGrid initialProducts={serializedProducts} />

      </div>
    </div>
  );
}
