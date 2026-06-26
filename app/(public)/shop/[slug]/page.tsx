import React from "react";
import type { Metadata } from "next";
import { getPublishedProducts, getPublishedProductBySlug } from "@/lib/product-cache";
import type { Product } from "@/types";
import { Timestamp } from "firebase/firestore";
import ProductGallery from "@/components/product/ProductGallery";
import SizePriceSelector from "@/components/product/SizePriceSelector";
import ScentPyramid from "@/components/product/ScentPyramid";
import ProductCard from "@/components/product/ProductCard";
import { FiClock, FiWind, FiCalendar, FiActivity } from "react-icons/fi";

// Revalidation time for ISR
export const revalidate = 3600;

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

interface ProductPageProps {
  params: {
    slug: string;
  };
}

// ─── Fetch Product Helper ──────────────────────────────────────────────────
async function fetchProduct(slug: string): Promise<Product | null> {
  try {
    const product = await getPublishedProductBySlug(slug);
    if (product) return product;
  } catch (error) {
    console.warn("Product cache error on detail page, using mock fallback:", error);
  }
  
  // Fallback to Mock Data
  const fallback = MOCK_PRODUCTS.find((p) => p.slug === slug);
  return fallback || null;
}

// ─── Static Params Generation ──────────────────────────────────────────────
export async function generateStaticParams() {
  let products: Product[] = [];
  
  try {
    products = await getPublishedProducts();
  } catch {
    products = MOCK_PRODUCTS;
  }

  return products.map((p) => ({ slug: p.slug }));
}

import { getOptimizedImage } from "@/lib/imgbb/config";

// ─── Metadata Generation ───────────────────────────────────────────────────
export async function generateMetadata({
  params: { slug },
}: ProductPageProps): Promise<Metadata> {
  const product = await fetchProduct(slug);
  if (!product) return {};

  const title = `${product.brand} ${product.perfumeName} | Real Dekant`;
  const description = `${product.brand} - ${product.perfumeName} orijinal marka niş parfüm dekantı (deneme boyu). 3ml, 5ml ve 10ml boyut seçenekleri ile.`;

  const firstImg = product.images?.[0];
  const firstImgUrl = firstImg ? (typeof firstImg === "string" ? firstImg : firstImg.url) : "";
  const ogImageUrl = getOptimizedImage(firstImgUrl, "og");

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: product.perfumeName,
        },
      ],
    },
  };
}

export default async function ProductDetailPage({
  params: { slug },
}: ProductPageProps) {
  const product = await fetchProduct(slug);
  if (!product) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center bg-cream-light text-charcoal">
        <p className="font-playfair text-xl font-bold mb-2">Parfüm Bulunamadı</p>
        <p className="font-montserrat text-xs text-charcoal/50">
          Ulaşmaya çalıştığınız ürün kataloğumuzda mevcut değil.
        </p>
      </div>
    );
  }
  const firstImg = product.images?.[0];
  const firstImgUrl = firstImg ? (typeof firstImg === "string" ? firstImg : firstImg.url) : "";

  // Load all products to compute similar items (uses same cache, no extra Firestore read)
  let allProducts: Product[] = [];
  try {
    allProducts = await getPublishedProducts();
  } catch {
    allProducts = MOCK_PRODUCTS;
  }
  if (allProducts.length === 0) {
    allProducts = MOCK_PRODUCTS;
  }

  // Compute similar products (filter by same brand or same scentFamily, max 4 cards)
  const similarProducts = allProducts
    .filter((p) => p.id !== product.id)
    .filter(
      (p) =>
        p.brand === product.brand ||
        p.scentFamily.some((sf) => product.scentFamily.includes(sf))
    )
    .slice(0, 4);

  // JSON-LD Product Schema
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.perfumeName,
    "image": getOptimizedImage(firstImgUrl, "full"),
    "description": `${product.brand} - ${product.perfumeName} Perfume Decant`,
    "sku": product.sku,
    "brand": {
      "@type": "Brand",
      "name": product.brand,
    },
    "offers": {
      "@type": "AggregateOffer",
      "priceCurrency": "TRY",
      "lowPrice": Math.min(...Object.values(product.prices).filter((p) => typeof p === "number")),
      "highPrice": Math.max(...Object.values(product.prices).filter((p) => typeof p === "number")),
      "offerCount": Object.keys(product.prices).length,
      "availability": "https://schema.org/InStock",
      "offers": Object.entries(product.prices).map(([size, price]) => ({
        "@type": "Offer",
        "price": price,
        "priceCurrency": "TRY",
        "availability": "https://schema.org/InStock",
        "sku": `${product.sku}-${size}`,
        "name": `${product.brand} ${product.perfumeName} - ${size}`
      }))
    },
  };

  // Plain objects serialization helper for client component props
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const serializeTimestamp = (ts: any) => {
    if (!ts) return null;
    if (typeof ts.toDate === "function") {
      return { seconds: ts.seconds, nanoseconds: ts.nanoseconds };
    }
    return ts;
  };

  const serializedProduct = JSON.parse(JSON.stringify({
    ...product,
    createdAt: serializeTimestamp(product.createdAt),
    updatedAt: serializeTimestamp(product.updatedAt),
    newUntil: serializeTimestamp(product.newUntil),
  }));

  const serializedSimilarProducts = similarProducts.map((p) => {
    const obj = {
      ...p,
      createdAt: serializeTimestamp(p.createdAt),
      updatedAt: serializeTimestamp(p.updatedAt),
      newUntil: serializeTimestamp(p.newUntil),
    };
    return JSON.parse(JSON.stringify(obj));
  });

  // Localize gender tag
  const genderLabel = product.gender === "male" 
    ? "Erkek" 
    : product.gender === "female" 
      ? "Kadın" 
      : "Unisex";

  return (
    <div className="bg-cream-light min-h-screen py-6 sm:py-12">
      
      {/* JSON-LD Script tag */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-10 sm:space-y-16">
        
        {/* Top Segment: Gallery + Main Specs */}
        <div className="grid grid-cols-1 md:grid-cols-10 gap-6 sm:gap-10 lg:gap-16 items-start">
          
          {/* Left 60%: Gallery */}
          <div className="md:col-span-6 w-full">
            <ProductGallery images={product.images} altText={product.perfumeName} />
          </div>

          {/* Right 40%: Detail Actions */}
          <div className="md:col-span-4 w-full space-y-6">
            <div className="space-y-3">
              {/* Brand (Montserrat cream small caps badge) */}
              <div className="block">
                <span 
                  className="inline-block bg-charcoal text-cream-light font-montserrat text-[10px] tracking-[0.25em] uppercase font-bold py-1.5 px-3.5"
                  style={{ fontVariant: "small-caps" }}
                >
                  {product.brand}
                </span>
              </div>
              {/* Perfume Name (Playfair gold large) */}
              <h1 className="font-playfair text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-wide text-[#C9A84C]">
                {product.perfumeName}
              </h1>
            </div>

             {/* Gender Badge & Scent Family Info */}
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="bg-white border border-[#C9A84C]/20 text-charcoal text-[10px] tracking-wider uppercase py-1 px-3 font-montserrat font-semibold">
                Cinsiyet: {genderLabel}
              </span>
              <span className="bg-[#C9A84C]/10 text-charcoal text-[10px] tracking-wider uppercase py-1 px-3 font-montserrat font-semibold">
                Koku Ailesi: {product.scentFamily.join(", ")}
              </span>
            </div>

            {/* Interactive size and price selector */}
            <SizePriceSelector product={serializedProduct} />

            {/* Mini notes description */}
            <div className="pt-6 border-t border-[#C9A84C]/15 space-y-2.5">
              <span className="font-montserrat text-[10px] tracking-widest text-charcoal/50 uppercase block font-semibold">
                Özellikler:
              </span>
              <ul className="font-montserrat text-[11px] text-charcoal/70 tracking-wider space-y-1.5 leading-relaxed">
                <li>• <strong>Kalıcılık:</strong> {product.longevity || "Yüksek"}</li>
                <li>• <strong>Yayılım (Sillage):</strong> {product.sillage || "Yoğun"}</li>
                <li>• <strong>Mevsim:</strong> {product.season && product.season.length > 0 ? product.season.join(", ") : "Dört Mevsim"}</li>
              </ul>
            </div>
          </div>

        </div>

        {/* Middle Segment: Scent Pyramid + Badges */}
        <div className="border-t border-[#C9A84C]/15 pt-10 sm:pt-16 grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-start">
          
          {/* Left: Pyramid */}
          <ScentPyramid notes={product.notes} />

          {/* Right: Badges Grid (Pill style layout) */}
          <div className="space-y-6">
            <div className="text-center lg:text-left space-y-2">
              <span className="font-montserrat text-[9px] tracking-[0.3em] text-[#C9A84C] uppercase font-semibold block">
                Kullanım Rehberi
              </span>
              <h3 className="font-playfair text-xl sm:text-2xl font-bold uppercase tracking-wider text-charcoal">
                Koku Karakteristiği
              </h3>
              <div className="h-0.5 w-12 bg-[#C9A84C]/45 lg:mx-0 mx-auto mt-2" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Badge 1: Kalıcılık */}
              <div className="bg-white border border-[#C9A84C]/15 rounded-full px-5 py-3.5 flex items-center space-x-4 rtl:space-x-reverse transition-all hover:border-[#C9A84C]/45 hover:shadow-sm">
                <div className="p-2.5 bg-[#C9A84C]/10 rounded-full text-[#C9A84C]">
                  <FiClock size={16} />
                </div>
                <div className="flex flex-col text-left rtl:text-right">
                  <span className="font-montserrat text-[9px] tracking-wider uppercase text-charcoal/40 font-bold leading-none mb-1">Kalıcılık</span>
                  <span className="font-montserrat text-xs text-charcoal/80 font-semibold leading-none">{product.longevity || "Yüksek"}</span>
                </div>
              </div>

              {/* Badge 2: Yayılım */}
              <div className="bg-white border border-[#C9A84C]/15 rounded-full px-5 py-3.5 flex items-center space-x-4 rtl:space-x-reverse transition-all hover:border-[#C9A84C]/45 hover:shadow-sm">
                <div className="p-2.5 bg-[#C9A84C]/10 rounded-full text-[#C9A84C]">
                  <FiWind size={16} />
                </div>
                <div className="flex flex-col text-left rtl:text-right">
                  <span className="font-montserrat text-[9px] tracking-wider uppercase text-charcoal/40 font-bold leading-none mb-1">Yayılım (Sillage)</span>
                  <span className="font-montserrat text-xs text-charcoal/80 font-semibold leading-none">{product.sillage || "Yoğun"}</span>
                </div>
              </div>

              {/* Badge 3: Mevsim */}
              <div className="bg-white border border-[#C9A84C]/15 rounded-full px-5 py-3.5 flex items-center space-x-4 rtl:space-x-reverse transition-all hover:border-[#C9A84C]/45 hover:shadow-sm">
                <div className="p-2.5 bg-[#C9A84C]/10 rounded-full text-[#C9A84C]">
                  <FiCalendar size={16} />
                </div>
                <div className="flex flex-col text-left rtl:text-right">
                  <span className="font-montserrat text-[9px] tracking-wider uppercase text-charcoal/40 font-bold leading-none mb-1">Mevsim</span>
                  <span className="font-montserrat text-xs text-charcoal/80 font-semibold leading-none truncate max-w-[120px]">
                    {product.season && product.season.length > 0 ? product.season.join(" / ") : "Dört Mevsim"}
                  </span>
                </div>
              </div>

              {/* Badge 4: Zaman */}
              <div className="bg-white border border-[#C9A84C]/15 rounded-full px-5 py-3.5 flex items-center space-x-4 rtl:space-x-reverse transition-all hover:border-[#C9A84C]/45 hover:shadow-sm">
                <div className="p-2.5 bg-[#C9A84C]/10 rounded-full text-[#C9A84C]">
                  <FiActivity size={16} />
                </div>
                <div className="flex flex-col text-left rtl:text-right">
                  <span className="font-montserrat text-[9px] tracking-wider uppercase text-charcoal/40 font-bold leading-none mb-1">Zaman</span>
                  <span className="font-montserrat text-xs text-charcoal/80 font-semibold leading-none">Gece / Gündüz</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Segment: Similar Products */}
        {serializedSimilarProducts.length > 0 && (
          <div className="border-t border-[#C9A84C]/15 pt-16">
            <div className="text-center space-y-2 mb-10">
              <span className="font-montserrat text-[9px] tracking-[0.3em] text-[#C9A84C] uppercase font-semibold block">
                Önerilenler
              </span>
              <h3 className="font-playfair text-xl sm:text-2xl font-bold uppercase tracking-wider text-charcoal">
                Benzer Parfümler
              </h3>
              <div className="h-0.5 w-12 bg-[#C9A84C]/45 mx-auto mt-2" />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
              {serializedSimilarProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
