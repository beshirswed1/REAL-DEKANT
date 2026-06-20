import React from "react";
import { getDocuments, where } from "@/lib/firebase/firestore";
import { COLLECTIONS } from "@/lib/firebase/firestore";
import type { Product } from "@/types";
import { Timestamp } from "firebase/firestore";
import ProductFilters from "@/components/product/ProductFilters";
import ProductGrid from "@/components/product/ProductGrid";

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

interface ShopPageProps {
  searchParams: {
    gender?: string;
    brand?: string | string[];
    scent?: string | string[];
    size?: string | string[];
    season?: string | string[];
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
    page?: string;
  };
}

export default async function ShopPage({
  searchParams,
}: ShopPageProps) {

  // Parse filters
  const genderFilter = searchParams.gender || "";
  const brandFilter = searchParams.brand
    ? Array.isArray(searchParams.brand)
      ? searchParams.brand
      : [searchParams.brand]
    : [];
  const scentFilter = searchParams.scent
    ? Array.isArray(searchParams.scent)
      ? searchParams.scent
      : [searchParams.scent]
    : [];
  const sizeFilter = searchParams.size
    ? Array.isArray(searchParams.size)
      ? searchParams.size
      : [searchParams.size]
    : [];
  const seasonFilter = searchParams.season
    ? Array.isArray(searchParams.season)
      ? searchParams.season
      : [searchParams.season]
    : [];
  const minPriceFilter = searchParams.minPrice ? parseInt(searchParams.minPrice) : 0;
  const maxPriceFilter = searchParams.maxPrice ? parseInt(searchParams.maxPrice) : Infinity;
  const sort = searchParams.sort || "newest";
  const page = parseInt(searchParams.page || "1");

  // Fetch products
  let products: Product[] = [];
  try {
    products = await getDocuments<Product>(COLLECTIONS.PRODUCTS, [
      where("isPublished", "==", true),
    ]);
  } catch (error) {
    console.warn("Firestore fetch failed in shop page, using mock catalog fallback:", error);
  }

  if (products.length === 0) {
    products = MOCK_PRODUCTS;
  }

  // 1. FILTERING
  const filteredProducts = products.filter((product) => {
    // Gender
    if (genderFilter && product.gender !== genderFilter) return false;

    // Brand
    if (brandFilter.length > 0 && !brandFilter.includes(product.brand)) return false;

    // Scent family
    if (
      scentFilter.length > 0 &&
      !product.scentFamily.some((s) => scentFilter.includes(s))
    )
      return false;

    // Sizes
    if (
      sizeFilter.length > 0 &&
      !sizeFilter.some((sz) => product.prices[sz as "3ml" | "5ml" | "10ml"] !== undefined)
    )
      return false;

    // Season
    if (
      seasonFilter.length > 0 &&
      !product.season.some((sn) => seasonFilter.includes(sn))
    )
      return false;

    // Price
    const lowestAvailablePrice = Math.min(
      ...Object.values(product.prices || {}).map(Number).filter((p) => !isNaN(p))
    );
    if (lowestAvailablePrice < minPriceFilter || lowestAvailablePrice > maxPriceFilter)
      return false;

    return true;
  });

  // 2. SORTING
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const getLowestPrice = (prod: Product) =>
      Math.min(...Object.values(prod.prices || {}).map(Number).filter((p) => !isNaN(p)));

    switch (sort) {
      case "cheapest":
        return getLowestPrice(a) - getLowestPrice(b);
      case "expensive":
        return getLowestPrice(b) - getLowestPrice(a);
      case "bestseller":
        return b.soldCount - a.soldCount;
      case "newest":
      default:
        // Compare Timestamps
        const timeA = a.createdAt?.seconds || 0;
        const timeB = b.createdAt?.seconds || 0;
        return timeB - timeA;
    }
  });

  // 3. PAGINATION
  const itemsPerPage = 12;
  const totalCount = sortedProducts.length;
  const totalPages = Math.ceil(totalCount / itemsPerPage);
  const currentPage = page > totalPages ? Math.max(1, totalPages) : page;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = sortedProducts.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const serializeTimestamp = (ts: any) => {
    if (!ts) return null;
    if (typeof ts.toDate === "function") {
      return { seconds: ts.seconds, nanoseconds: ts.nanoseconds };
    }
    return ts;
  };

  const serializedPaginatedProducts = paginatedProducts.map((p) => {
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
        {/* Abstract shapes / lines for premium feel */}
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

        {/* Catalog layout */}
        <div className="flex flex-col md:flex-row gap-8 items-start">
          
          {/* Sidebar Filters (Desktop) */}
          <aside className="hidden md:block w-[280px] shrink-0 sticky top-24">
            <ProductFilters />
          </aside>

          {/* Main Listing Grid */}
          <ProductGrid
            products={serializedPaginatedProducts}
            totalCount={totalCount}
            currentPage={currentPage}
            totalPages={totalPages}
          />

        </div>
      </div>
    </div>
  );
}
