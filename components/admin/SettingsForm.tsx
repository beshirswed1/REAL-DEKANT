"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type { FormEvent } from "react";
import Image from "next/image";

// ─── Types ───────────────────────────────────────────────────────────────────

interface HeroSlide {
  image: string;
  label: string;
  headline: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface SiteConfig {
  // Store
  freeShippingThreshold: number;
  shippingFee: number;
  codServiceFee: number;
  maintenanceMode: boolean;
  // Contact
  contactPhone: string;
  contactWhatsapp: string;
  contactEmail: string;
  contactAddress: string;
  contactWorkingHours: string;
  contactMapsUrl: string;
  // Social
  contactInstagram: string;
  contactTikTok: string;
  contactSnapchat: string;
  contactFacebook: string;
  contactTwitter: string;
  contactYouTube: string;
  // Homepage
  heroSlides: HeroSlide[];
  showBestSellers: boolean;
  showNewArrivals: boolean;
  showMenPerfumes: boolean;
  showBrandsMarquee: boolean;
  showWhyDekant: boolean;
  showFaq: boolean;
  // FAQ
  faqItems: FaqItem[];
  // Why Dekant Content
  whyDekantTitle: string;
  whyDekantDescription: string;
  whyDekantBenefits: string[];
  whyDekantQuote: string;
  // Content
  footerDescription: string;
  siteMotto: string;
  // Legal
  privacyPolicy: string;
  termsOfUse: string;
}

interface SettingsFormProps {
  initialConfig: SiteConfig;
}

// ─── Tab Definition ──────────────────────────────────────────────────────────

type TabKey = "store" | "homepage" | "contact" | "social" | "content" | "legal";

interface TabDef {
  key: TabKey;
  label: string;
  icon: React.ReactNode;
  description: string;
}

const TABS: TabDef[] = [
  {
    key: "store",
    label: "Mağaza",
    description: "Kargo limitleri, ücretler ve sistem modu",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
      </svg>
    ),
  },
  {
    key: "homepage",
    label: "Ana Sayfa",
    description: "Hero slaytlar, bölüm görünürlüğü ve içerik",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    key: "contact",
    label: "İletişim",
    description: "Telefon, WhatsApp, adres ve harita",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
      </svg>
    ),
  },
  {
    key: "social",
    label: "Sosyal Medya",
    description: "Instagram, TikTok, Facebook ve diğer hesaplar",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
      </svg>
    ),
  },
  {
    key: "content",
    label: "İçerik",
    description: "Footer açıklamaları ve site sloganı",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
      </svg>
    ),
  },
  {
    key: "legal",
    label: "Yasal",
    description: "Gizlilik politikası ve kullanım şartları",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
      </svg>
    ),
  },
];

// ─── Skeleton Component ──────────────────────────────────────────────────────

function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-gray-200 rounded-lg ${className}`} />
  );
}

function FieldSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-11 w-full" />
      <Skeleton className="h-3 w-48" />
    </div>
  );
}

function TabSkeleton() {
  return (
    <div className="p-6 sm:p-8 space-y-8 animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FieldSkeleton /><FieldSkeleton />
        <FieldSkeleton /><FieldSkeleton />
      </div>
    </div>
  );
}

// ─── Toggle Switch Component ─────────────────────────────────────────────────

function ToggleSwitch({
  id,
  checked,
  onChange,
  disabled,
  label,
  description,
}: {
  id: string;
  checked: boolean;
  onChange: (val: boolean) => void;
  disabled: boolean;
  label: string;
  description?: string;
}) {
  return (
    <div className="flex items-start gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-gray-50 transition-colors group">
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative mt-0.5 inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 focus:ring-offset-2 disabled:opacity-60 ${
          checked ? "bg-[#D4AF37]" : "bg-gray-300"
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-300 ease-in-out ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
      <div className="flex flex-col">
        <label htmlFor={id} className="text-sm font-bold text-gray-900 cursor-pointer select-none group-hover:text-gray-800">
          {label}
        </label>
        {description && (
          <p className="text-xs text-gray-500 mt-1 select-none">{description}</p>
        )}
      </div>
    </div>
  );
}

// ─── Styled Input Component ──────────────────────────────────────────────────

function SettingsInput({
  id,
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  hint,
  required,
  disabled,
  prefix,
  rows,
}: {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  hint?: string;
  required?: boolean;
  disabled?: boolean;
  prefix?: string;
  rows?: number;
}) {
  const baseClass =
    "w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] transition-all disabled:opacity-60";

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-gray-900 mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {rows ? (
        <textarea
          id={id}
          rows={rows}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={`${baseClass} resize-none`}
        />
      ) : prefix ? (
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <span className="text-gray-500 font-medium">{prefix}</span>
          </div>
          <input
            id={id}
            type={type}
            min={type === "number" ? "0" : undefined}
            step={type === "number" ? "1" : undefined}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            required={required}
            className={`${baseClass} pl-8`}
          />
        </div>
      ) : (
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={baseClass}
        />
      )}
      {hint && <p className="mt-2 text-xs text-gray-500">{hint}</p>}
    </div>
  );
}

// ─── Social Platform Config ──────────────────────────────────────────────────

interface SocialPlatform {
  key: string;
  label: string;
  placeholder: string;
  hint: string;
  color: string;
  icon: React.ReactNode;
}

const SOCIAL_PLATFORMS: SocialPlatform[] = [
  {
    key: "contactInstagram",
    label: "Instagram",
    placeholder: "realdekant",
    hint: "@ olmadan kullanıcı adınızı giriniz",
    color: "#E1306C",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
      </svg>
    ),
  },
  {
    key: "contactTikTok",
    label: "TikTok",
    placeholder: "realdekant",
    hint: "@ olmadan kullanıcı adınızı giriniz",
    color: "#000000",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V9.83A8.16 8.16 0 0019.59 11V7.5a4.83 4.83 0 010-.81z" />
      </svg>
    ),
  },
  {
    key: "contactSnapchat",
    label: "Snapchat",
    placeholder: "realdekant",
    hint: "@ olmadan kullanıcı adınızı giriniz",
    color: "#FFFC00",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l-.003.06c-.012.18-.022.345-.03.51.075.045.203.09.401.09.3-.016.659-.12.922-.214.4-.15.588-.21.783-.15.3.09.398.39.188.675a1.25 1.25 0 01-.329.293c-.15.09-.465.24-.659.33-.195.091-.375.15-.45.21-.135.12-.12.36-.015.645.495 1.095 1.155 1.875 2.07 2.37.21.12.405.21.495.255.15.075.285.195.285.39 0 .39-.6.645-1.17.78-.165.03-.345.075-.465.15a.58.58 0 00-.255.39c-.06.27-.075.42-.465.57-.24.09-.54.15-.854.18-.255.015-.39.015-.585.255-.27.33-.555.72-1.515 1.05-.63.21-1.29.315-1.965.315-3.255 0-5.685-2.145-7.77-2.145-.675 0-1.335.105-1.965.315-.96.33-1.245.72-1.515 1.05-.195.24-.33.24-.585.255-.315.03-.615-.09-.855-.18-.39-.15-.405-.3-.465-.57a.58.58 0 00-.255-.39c-.12-.075-.3-.12-.465-.15C.6 17.535 0 17.28 0 16.89c0-.195.135-.315.285-.39.09-.045.285-.135.495-.255.915-.495 1.575-1.275 2.07-2.37.105-.285.12-.525-.015-.645-.075-.06-.255-.12-.45-.21-.195-.09-.51-.24-.66-.33a1.25 1.25 0 01-.328-.293c-.21-.285-.113-.585.187-.675.195-.06.383 0 .783.15.263.094.623.198.922.214.199 0 .326-.045.401-.09-.008-.165-.018-.33-.03-.51l-.003-.06c-.104-1.628-.23-3.654.3-4.847C4.653 1.07 8.01.793 9.003.793h3.203z" />
      </svg>
    ),
  },
  {
    key: "contactFacebook",
    label: "Facebook",
    placeholder: "realdekant",
    hint: "Sayfa adınızı veya URL slug giriniz",
    color: "#1877F2",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    key: "contactTwitter",
    label: "X (Twitter)",
    placeholder: "realdekant",
    hint: "@ olmadan kullanıcı adınızı giriniz",
    color: "#000000",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    key: "contactYouTube",
    label: "YouTube",
    placeholder: "@realdekant",
    hint: "Kanal adı veya @ handle giriniz",
    color: "#FF0000",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
];

// ─── Hero Slide Editor ───────────────────────────────────────────────────────

function HeroSlideEditor({
  slide,
  index,
  onUpdate,
  onRemove,
  disabled,
  total,
}: {
  slide: HeroSlide;
  index: number;
  onUpdate: (index: number, slide: HeroSlide) => void;
  onRemove: (index: number) => void;
  disabled: boolean;
  total: number;
}) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { uploadToImgBB } = await import("@/lib/imgbb/config");
      const result = await uploadToImgBB(file, `hero-slide-${index + 1}`);
      onUpdate(index, { ...slide, image: result.url });
    } catch (err) {
      console.error("Hero image upload failed:", err);
      alert("Görsel yüklenemedi. Lütfen tekrar deneyiniz.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="relative bg-white rounded-2xl border border-gray-150 shadow-sm overflow-hidden transition-all hover:shadow-md group">
      {/* Slide Number Badge */}
      <div className="absolute top-3 left-3 z-10 w-7 h-7 rounded-full bg-[#111] text-white flex items-center justify-center text-xs font-bold shadow">
        {index + 1}
      </div>

      {/* Remove Button */}
      {total > 1 && (
        <button
          type="button"
          onClick={() => onRemove(index)}
          disabled={disabled}
          className="absolute top-3 right-3 z-10 w-7 h-7 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors disabled:opacity-50 shadow"
          title="Bu slaytı sil"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}

      {/* Image Section */}
      <div className="relative h-40 bg-gray-100 overflow-hidden">
        {slide.image ? (
          <Image
            src={slide.image}
            alt={`Slayt ${index + 1}`}
            fill
            sizes="300px"
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8 mb-1">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
            </svg>
            <span className="text-xs">Görsel yükleyin</span>
          </div>
        )}

        {/* Upload overlay */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || disabled}
          className="absolute inset-0 bg-black/0 hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100"
        >
          {uploading ? (
            <div className="flex items-center gap-2 text-white text-xs font-medium">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Yükleniyor...
            </div>
          ) : (
            <span className="text-white text-xs font-semibold bg-black/50 px-3 py-1.5 rounded-lg">
              📷 Değiştir
            </span>
          )}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
      </div>

      {/* Text Fields */}
      <div className="p-4 space-y-3">
        <input
          type="text"
          placeholder="Etiket (örn: Lüks Koleksiyon)"
          value={slide.label}
          onChange={(e) => onUpdate(index, { ...slide, label: e.target.value })}
          disabled={disabled}
          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] transition-all disabled:opacity-60"
        />
        <input
          type="text"
          placeholder="Başlık (örn: REAL DEKANT)"
          value={slide.headline}
          onChange={(e) => onUpdate(index, { ...slide, headline: e.target.value })}
          disabled={disabled}
          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] transition-all disabled:opacity-60"
        />
        <input
          type="text"
          placeholder="Alt Başlık (örn: Görünmez Ama Unutulmaz)"
          value={slide.subtitle}
          onChange={(e) => onUpdate(index, { ...slide, subtitle: e.target.value })}
          disabled={disabled}
          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] transition-all disabled:opacity-60"
        />
        <div className="grid grid-cols-2 gap-2">
          <input
            type="text"
            placeholder="Buton Metni"
            value={slide.ctaText}
            onChange={(e) => onUpdate(index, { ...slide, ctaText: e.target.value })}
            disabled={disabled}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] transition-all disabled:opacity-60"
          />
          <input
            type="text"
            placeholder="Buton Linki (örn: /shop)"
            value={slide.ctaLink}
            onChange={(e) => onUpdate(index, { ...slide, ctaLink: e.target.value })}
            disabled={disabled}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] transition-all disabled:opacity-60"
          />
        </div>
      </div>
    </div>
  );
}

// ─── Save Button Component ───────────────────────────────────────────────────

function SaveButton({ saving, label = "Kaydet" }: { saving: boolean; label?: string }) {
  return (
    <div className="pt-6 border-t border-gray-100">
      <button
        type="submit"
        disabled={saving}
        className="w-full sm:w-auto px-8 py-3 bg-[#111] hover:bg-black text-white text-sm font-bold rounded-xl transition-all shadow-sm hover:shadow-lg disabled:opacity-70 flex items-center justify-center gap-2"
      >
        {saving ? (
          <>
            <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Kaydediliyor...
          </>
        ) : (
          <>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
              <polyline points="17 21 17 13 7 13 7 21" />
              <polyline points="7 3 7 8 15 8" />
            </svg>
            {label}
          </>
        )}
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ─── Main SettingsForm Component ─────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

export default function SettingsForm({ initialConfig }: SettingsFormProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("store");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // ─── Store State ─────────────────
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(initialConfig.freeShippingThreshold.toString());
  const [shippingFee, setShippingFee] = useState(initialConfig.shippingFee.toString());
  const [codServiceFee, setCodServiceFee] = useState(initialConfig.codServiceFee.toString());
  const [maintenanceMode, setMaintenanceMode] = useState(initialConfig.maintenanceMode);

  // ─── Contact State ───────────────
  const [contactPhone, setContactPhone] = useState(initialConfig.contactPhone || "");
  const [contactWhatsapp, setContactWhatsapp] = useState(initialConfig.contactWhatsapp || "");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [contactEmail, setContactEmail] = useState(initialConfig.contactEmail || "");
  const [contactAddress, setContactAddress] = useState(initialConfig.contactAddress || "");
  const [contactWorkingHours, setContactWorkingHours] = useState(initialConfig.contactWorkingHours || "");
  const [contactMapsUrl, setContactMapsUrl] = useState(initialConfig.contactMapsUrl || "");

  // ─── Social State ────────────────
  const [socialValues, setSocialValues] = useState<Record<string, string>>({
    contactInstagram: initialConfig.contactInstagram || "",
    contactTikTok: initialConfig.contactTikTok || "",
    contactSnapchat: initialConfig.contactSnapchat || "",
    contactFacebook: initialConfig.contactFacebook || "",
    contactTwitter: initialConfig.contactTwitter || "",
    contactYouTube: initialConfig.contactYouTube || "",
  });

  // ─── Homepage State ──────────────
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>(
    initialConfig.heroSlides?.length
      ? initialConfig.heroSlides
      : [
          { image: "/images/hero-1.png", label: "Görünmez Bir İzahtır Koku", headline: "REAL DEKANT", subtitle: "Görünmez Ama Unutulmaz", ctaText: "Mağazayı Keşfet", ctaLink: "/shop" },
          { image: "/images/hero-2.png", label: "Lüks Koleksiyon", headline: "NİŞ KOKULAR\nUYGUN FİYATLAR", subtitle: "Lüks parfümleri deneme boyunda keşfedin", ctaText: "Koleksiyonu İncele", ctaLink: "/shop" },
          { image: "/images/hero-3.png", label: "%100 Orijinal", headline: "STERİL VE\nGÜVENLİ", subtitle: "Sızdırmaz şişelerle güvenli alışveriş deneyimi", ctaText: "Hemen Alışveriş Yap", ctaLink: "/shop" },
        ]
  );
  const [showBestSellers, setShowBestSellers] = useState(initialConfig.showBestSellers ?? true);
  const [showNewArrivals, setShowNewArrivals] = useState(initialConfig.showNewArrivals ?? true);
  const [showMenPerfumes, setShowMenPerfumes] = useState(initialConfig.showMenPerfumes ?? true);
  const [showBrandsMarquee, setShowBrandsMarquee] = useState(initialConfig.showBrandsMarquee ?? true);
  const [showWhyDekant, setShowWhyDekant] = useState(initialConfig.showWhyDekant ?? true);
  const [showFaq, setShowFaq] = useState(initialConfig.showFaq ?? true);

  // ─── FAQ State ────────────────────
  const [faqItems, setFaqItems] = useState<FaqItem[]>(
    initialConfig.faqItems?.length
      ? initialConfig.faqItems
      : [
          { question: "Dekant parfüm nedir?", answer: "Dekant parfüm, orijinal büyük boy parfüm şişelerinden steril ve sızdırmaz küçük şişelere aktarılarak hazırlanan orijinal parfüm örnekleridir." },
          { question: "Ürünleriniz orijinal mi?", answer: "Evet, tüm ürünlerimiz %100 orijinal marka parfümlerden hazırlanmaktadır. Orijinallik garantisi sunuyoruz." },
          { question: "Kargo süresi ne kadar?", answer: "Siparişleriniz 1-3 iş günü içerisinde kargoya verilmektedir. Kargo süresi bulunduğunuz konuma göre değişiklik gösterebilir." },
        ]
  );

  // ─── Why Dekant Content ──────────
  const [whyDekantTitle, setWhyDekantTitle] = useState(initialConfig.whyDekantTitle || "Neden Dekant Parfüm Tercih Edilmeli?");
  const [whyDekantDescription, setWhyDekantDescription] = useState(
    initialConfig.whyDekantDescription ||
      "Dekant parfüm, orijinal büyük boy parfüm şişelerinden steril, sızdırmaz ve taşınabilir küçük şişelere aktarılarak hazırlanan orijinal parfüm örnekleridir. Bu yöntem sayesinde parfüm tutkunları, yüksek fiyatlara sahip designer ve niche kokuları çok daha uygun maliyetle deneme fırsatı bulur."
  );
  const [whyDekantBenefits, setWhyDekantBenefits] = useState<string[]>(
    initialConfig.whyDekantBenefits?.length
      ? initialConfig.whyDekantBenefits
      : [
          "Dilediğiniz pahalı kokuyu çok daha ekonomik bir şekilde test edin.",
          "Hafif ve sızdırmaz şişelerle seyahat ve çanta konforunu yaşayın.",
          "Orijinalliğin güvencesiyle ekonomik, güvenli ve özgür bir keşif deneyimi.",
        ]
  );
  const [whyDekantQuote, setWhyDekantQuote] = useState(initialConfig.whyDekantQuote || "Koku, görünmeyen imzandır.");

  // ─── Content State ───────────────
  const [footerDescription, setFooterDescription] = useState(
    initialConfig.footerDescription || "Özenle seçilmiş, %100 orijinal marka parfümlerden hazırlanan lüks dekant (deneme boyu) koleksiyonu."
  );
  const [siteMotto, setSiteMotto] = useState(initialConfig.siteMotto || "Görünmez Ama Unutulmaz");

  // ─── Legal State ─────────────────
  const [privacyPolicy, setPrivacyPolicy] = useState(initialConfig.privacyPolicy || "");
  const [termsOfUse, setTermsOfUse] = useState(initialConfig.termsOfUse || "");

  // Simulate initial loading
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(timer);
  }, [activeTab]);

  const showToast = useCallback((message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  // ─── Section Save Handlers ─────────────────────────────────────────────────

  const saveSection = async (section: string, data: Record<string, unknown>) => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section, ...data }),
      });
      if (!res.ok) throw new Error();
      showToast("Ayarlar başarıyla güncellendi ✓", "success");
    } catch {
      showToast("Ayarlar kaydedilemedi. Lütfen tekrar deneyin.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleStoreSubmit = (e: FormEvent) => {
    e.preventDefault();
    const thresh = parseFloat(freeShippingThreshold);
    const ship = parseFloat(shippingFee);
    const cod = parseFloat(codServiceFee);
    if (isNaN(thresh) || thresh < 0 || isNaN(ship) || ship < 0 || isNaN(cod) || cod < 0) {
      showToast("Lütfen geçerli pozitif sayısal değerler giriniz", "error");
      return;
    }
    saveSection("store", { freeShippingThreshold: thresh, shippingFee: ship, codServiceFee: cod, maintenanceMode });
  };

  const handleContactSubmit = (e: FormEvent) => {
    e.preventDefault();
    saveSection("contact", { contactPhone, contactWhatsapp, contactEmail, contactAddress, contactWorkingHours, contactMapsUrl });
  };

  const handleSocialSubmit = (e: FormEvent) => {
    e.preventDefault();
    saveSection("social", socialValues);
  };

  const handleHomepageSubmit = (e: FormEvent) => {
    e.preventDefault();
    saveSection("homepage", {
      heroSlides,
      showBestSellers,
      showNewArrivals,
      showMenPerfumes,
      showBrandsMarquee,
      showWhyDekant,
      showFaq,
      faqItems,
      whyDekantTitle,
      whyDekantDescription,
      whyDekantBenefits,
      whyDekantQuote,
    });
  };

  const handleContentSubmit = (e: FormEvent) => {
    e.preventDefault();
    saveSection("content", { footerDescription, siteMotto });
  };

  const handleLegalSubmit = (e: FormEvent) => {
    e.preventDefault();
    saveSection("legal", { privacyPolicy, termsOfUse });
  };

  // ─── Hero Slide Helpers ────────────────────────────────────────────────────

  const addSlide = () => {
    if (heroSlides.length >= 6) {
      showToast("En fazla 6 slayt ekleyebilirsiniz", "error");
      return;
    }
    setHeroSlides([...heroSlides, { image: "", label: "", headline: "", subtitle: "", ctaText: "Keşfet", ctaLink: "/shop" }]);
  };

  const removeSlide = (index: number) => {
    setHeroSlides(heroSlides.filter((_, i) => i !== index));
  };

  const updateSlide = (index: number, updated: HeroSlide) => {
    const copy = [...heroSlides];
    copy[index] = updated;
    setHeroSlides(copy);
  };

  // ─── Benefits Helpers ──────────────────────────────────────────────────────

  const addBenefit = () => {
    if (whyDekantBenefits.length >= 6) return;
    setWhyDekantBenefits([...whyDekantBenefits, ""]);
  };

  const removeBenefit = (index: number) => {
    setWhyDekantBenefits(whyDekantBenefits.filter((_, i) => i !== index));
  };

  const updateBenefit = (index: number, value: string) => {
    const copy = [...whyDekantBenefits];
    copy[index] = value;
    setWhyDekantBenefits(copy);
  };

  // ─── FAQ Helpers ───────────────────────────────────────────────────────────

  const addFaqItem = () => {
    if (faqItems.length >= 15) {
      showToast("En fazla 15 soru ekleyebilirsiniz", "error");
      return;
    }
    setFaqItems([...faqItems, { question: "", answer: "" }]);
  };

  const removeFaqItem = (index: number) => {
    setFaqItems(faqItems.filter((_, i) => i !== index));
  };

  const updateFaqItem = (index: number, field: "question" | "answer", value: string) => {
    const copy = [...faqItems];
    copy[index] = { ...copy[index], [field]: value };
    setFaqItems(copy);
  };

  // ─── Render Tab Content ────────────────────────────────────────────────────

  const renderTabContent = () => {
    if (loading) return <TabSkeleton />;

    switch (activeTab) {
      // ═══ STORE TAB ═══
      case "store":
        return (
          <form onSubmit={handleStoreSubmit} className="p-6 sm:p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SettingsInput
                id="free-shipping-input"
                label="Ücretsiz Kargo Sınırı"
                type="number"
                value={freeShippingThreshold}
                onChange={setFreeShippingThreshold}
                prefix="₺"
                required
                disabled={saving}
                hint="Müşterinin sepet tutarı bu değere ulaştığında kargo ücretsiz olur. (Örn: 750)"
              />
              <SettingsInput
                id="shipping-fee-input"
                label="Sabit Kargo Ücreti"
                type="number"
                value={shippingFee}
                onChange={setShippingFee}
                prefix="₺"
                required
                disabled={saving}
                hint="Ücretsiz kargo sınırının altındaki siparişler için alınacak kargo bedeli."
              />
              <SettingsInput
                id="cod-fee-input"
                label="Kapıda Ödeme Hizmet Bedeli"
                type="number"
                value={codServiceFee}
                onChange={setCodServiceFee}
                prefix="₺"
                required
                disabled={saving}
                hint="Kapıda nakit/kartla ödeme seçildiğinde faturaya eklenecek ek hizmet bedeli."
              />
            </div>

            <div className="h-px bg-gray-100 my-2" />

            <ToggleSwitch
              id="maintenance-checkbox"
              checked={maintenanceMode}
              onChange={setMaintenanceMode}
              disabled={saving}
              label="Bakım Modu (Maintenance Mode)"
              description="Aktif edilirse, ziyaretçiler alışveriş yapamaz ve bakım ekranı gösterilir."
            />

            <SaveButton saving={saving} label="Mağaza Ayarlarını Kaydet" />
          </form>
        );

      // ═══ HOMEPAGE TAB ═══
      case "homepage":
        return (
          <form onSubmit={handleHomepageSubmit} className="p-6 sm:p-8 space-y-8">
            {/* Hero Slides Manager */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-gray-900">Hero Slaytları</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Ana sayfanın üstündeki büyük karusel görselleri ({heroSlides.length}/6)</p>
                </div>
                <button
                  type="button"
                  onClick={addSlide}
                  disabled={saving || heroSlides.length >= 6}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#D4AF37] text-[#111] text-xs font-bold rounded-lg hover:bg-[#c9a22e] transition-colors disabled:opacity-50"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5">
                    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Slayt Ekle
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {heroSlides.map((slide, i) => (
                  <HeroSlideEditor
                    key={i}
                    slide={slide}
                    index={i}
                    onUpdate={updateSlide}
                    onRemove={removeSlide}
                    disabled={saving}
                    total={heroSlides.length}
                  />
                ))}
              </div>
            </div>

            <div className="h-px bg-gray-100" />

            {/* Section Visibility Toggles */}
            <div>
              <h3 className="text-base font-bold text-gray-900 mb-1">Bölüm Görünürlüğü</h3>
              <p className="text-xs text-gray-500 mb-4">Ana sayfada hangi bölümlerin görüneceğini seçin</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <ToggleSwitch id="show-best-sellers" checked={showBestSellers} onChange={setShowBestSellers} disabled={saving} label="Çok Satanlar" description="En çok satılan ürünleri göster" />
                <ToggleSwitch id="show-new-arrivals" checked={showNewArrivals} onChange={setShowNewArrivals} disabled={saving} label="Yeni Gelenler" description="Yeni eklenen ürünleri göster" />
                <ToggleSwitch id="show-men-perfumes" checked={showMenPerfumes} onChange={setShowMenPerfumes} disabled={saving} label="Erkek Parfümleri" description="Erkek koleksiyonu bölümünü göster" />
                <ToggleSwitch id="show-brands-marquee" checked={showBrandsMarquee} onChange={setShowBrandsMarquee} disabled={saving} label="Marka Bandı" description="Marka logolarını kayan bant olarak göster" />
                <ToggleSwitch id="show-why-dekant" checked={showWhyDekant} onChange={setShowWhyDekant} disabled={saving} label="Neden Dekant?" description="Dekant parfüm açıklama bölümünü göster" />
                <ToggleSwitch id="show-faq" checked={showFaq} onChange={setShowFaq} disabled={saving} label="Sıkça Sorulan Sorular" description="SSS bölümünü ana sayfada göster" />
              </div>
            </div>

            {showWhyDekant && (
              <>
                <div className="h-px bg-gray-100" />

                {/* Why Dekant Content Editor */}
                <div>
                  <h3 className="text-base font-bold text-gray-900 mb-1">&quot;Neden Dekant?&quot; İçerik Düzenleyici</h3>
                  <p className="text-xs text-gray-500 mb-4">Ana sayfanın alt kısmındaki açıklama bölümünü düzenleyin</p>

                  <div className="space-y-5">
                    <SettingsInput id="why-dekant-title" label="Başlık" value={whyDekantTitle} onChange={setWhyDekantTitle} disabled={saving} placeholder="Neden Dekant Parfüm Tercih Edilmeli?" />
                    <SettingsInput id="why-dekant-desc" label="Açıklama Metni" value={whyDekantDescription} onChange={setWhyDekantDescription} disabled={saving} rows={4} placeholder="Dekant parfüm nedir, avantajları nelerdir..." />

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-semibold text-gray-900">Avantajlar Listesi</label>
                        <button
                          type="button"
                          onClick={addBenefit}
                          disabled={saving || whyDekantBenefits.length >= 6}
                          className="text-xs text-[#D4AF37] font-bold hover:underline disabled:opacity-50"
                        >
                          + Avantaj Ekle
                        </button>
                      </div>
                      <div className="space-y-2">
                        {whyDekantBenefits.map((b, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#D4AF37]/15 flex items-center justify-center text-[10px] font-bold text-[#D4AF37]">
                              {i + 1}
                            </span>
                            <input
                              type="text"
                              value={b}
                              onChange={(e) => updateBenefit(i, e.target.value)}
                              disabled={saving}
                              placeholder={`Avantaj ${i + 1}`}
                              className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] transition-all disabled:opacity-60"
                            />
                            {whyDekantBenefits.length > 1 && (
                              <button type="button" onClick={() => removeBenefit(i)} disabled={saving} className="text-red-400 hover:text-red-600 transition-colors disabled:opacity-50">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <SettingsInput id="why-dekant-quote" label="Alıntı" value={whyDekantQuote} onChange={setWhyDekantQuote} disabled={saving} placeholder="Koku, görünmeyen imzandır." hint="Alt kısımda italik olarak gösterilecek" />
                  </div>
                </div>
              </>
            )}

            {showFaq && (
              <>
                <div className="h-px bg-gray-100" />

                {/* FAQ Editor */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-base font-bold text-gray-900">Sıkça Sorulan Sorular (SSS)</h3>
                      <p className="text-xs text-gray-500 mt-0.5">Ana sayfada gösterilecek soru-cevapları düzenleyin ({faqItems.length}/15)</p>
                    </div>
                    <button
                      type="button"
                      onClick={addFaqItem}
                      disabled={saving || faqItems.length >= 15}
                      className="flex items-center gap-1.5 px-4 py-2 bg-[#D4AF37] text-[#111] text-xs font-bold rounded-lg hover:bg-[#c9a22e] transition-colors disabled:opacity-50"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5">
                        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                      Soru Ekle
                    </button>
                  </div>

                  <div className="space-y-3">
                    {faqItems.map((faq, i) => (
                      <div key={i} className="relative bg-gray-50/80 rounded-xl border border-gray-150 p-4 space-y-3 group hover:border-[#D4AF37]/30 transition-colors">
                        {/* Number Badge */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#D4AF37]/15 flex items-center justify-center text-[11px] font-bold text-[#D4AF37]">
                              {i + 1}
                            </span>
                            <span className="text-xs font-semibold text-gray-500">Soru {i + 1}</span>
                          </div>
                          {faqItems.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeFaqItem(i)}
                              disabled={saving}
                              className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded-full bg-red-100 text-red-500 flex items-center justify-center hover:bg-red-200 transition-all disabled:opacity-50"
                              title="Bu soruyu sil"
                            >
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3 h-3">
                                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                              </svg>
                            </button>
                          )}
                        </div>

                        {/* Question */}
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">Soru</label>
                          <input
                            type="text"
                            value={faq.question}
                            onChange={(e) => updateFaqItem(i, "question", e.target.value)}
                            disabled={saving}
                            placeholder="Örn: Dekant parfüm nedir?"
                            className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] transition-all disabled:opacity-60"
                          />
                        </div>

                        {/* Answer */}
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">Cevap</label>
                          <textarea
                            value={faq.answer}
                            onChange={(e) => updateFaqItem(i, "answer", e.target.value)}
                            disabled={saving}
                            rows={3}
                            placeholder="Sorunun cevabını yazınız..."
                            className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] transition-all disabled:opacity-60 resize-none"
                          />
                        </div>
                      </div>
                    ))}

                    {faqItems.length === 0 && (
                      <div className="text-center py-8 text-gray-400">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8 mx-auto mb-2 opacity-50">
                          <circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" />
                        </svg>
                        <p className="text-xs">Henüz soru eklenmemiş. &quot;Soru Ekle&quot; butonuna tıklayarak başlayın.</p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            <SaveButton saving={saving} label="Ana Sayfa Ayarlarını Kaydet" />
          </form>
        );

      // ═══ CONTACT TAB ═══
      case "contact":
        return (
          <form onSubmit={handleContactSubmit} className="p-6 sm:p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SettingsInput id="contact-phone" label="İletişim Telefonu" value={contactPhone} onChange={setContactPhone} placeholder="+90 555 123 45 67" disabled={saving} />
              <SettingsInput
                id="contact-whatsapp"
                label="WhatsApp Hattı"
                value={contactWhatsapp}
                onChange={setContactWhatsapp}
                placeholder="905551234567"
                disabled={saving}
                hint="Ülke kodu ile, boşluksuz yazınız (örn: 905551234567)"
              />
              <SettingsInput
                id="contact-email"
                label="İletişim E-posta Adresi"
                value={contactEmail}
                onChange={setContactEmail}
                placeholder="info@realdekant.com"
                disabled={saving}
              />
              <SettingsInput id="contact-working-hours" label="Çalışma Saatleri" value={contactWorkingHours} onChange={setContactWorkingHours} placeholder="Pazartesi - Cumartesi: 09:00 - 18:00" disabled={saving} />
              <SettingsInput
                id="contact-maps-url"
                label="Google Harita Embed"
                value={contactMapsUrl}
                onChange={setContactMapsUrl}
                placeholder='<iframe src="https://www.google.com/maps/embed?..." ...>'
                disabled={saving}
                hint="Google Maps'ten iframe kodunu veya doğrudan embed linkini yapıştırın"
              />
            </div>
            <SettingsInput id="contact-address" label="Açık Adres Bilgisi" value={contactAddress} onChange={setContactAddress} placeholder="Nişantaşı, Şişli, İstanbul, Türkiye" disabled={saving} rows={2} />

            <SaveButton saving={saving} label="İletişim Ayarlarını Kaydet" />
          </form>
        );

      // ═══ SOCIAL TAB ═══
      case "social":
        return (
          <form onSubmit={handleSocialSubmit} className="p-6 sm:p-8 space-y-5">
            <p className="text-xs text-gray-500 -mt-1 mb-2">Doldurduğunuz hesaplar otomatik olarak sitenin footer ve iletişim sayfasında görünecektir. Boş bırakılanlar gizlenecektir.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {SOCIAL_PLATFORMS.map((platform) => (
                <div key={platform.key} className="relative flex items-start gap-3 p-4 rounded-xl border border-gray-100 bg-gray-50/30 hover:bg-gray-50 transition-colors group">
                  {/* Platform Icon */}
                  <div
                    className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-colors"
                    style={{ backgroundColor: `${platform.color}15`, color: platform.color }}
                  >
                    {platform.icon}
                  </div>

                  {/* Input */}
                  <div className="flex-1 min-w-0">
                    <label className="block text-sm font-semibold text-gray-900 mb-1">{platform.label}</label>
                    <input
                      type="text"
                      value={socialValues[platform.key] || ""}
                      onChange={(e) => setSocialValues({ ...socialValues, [platform.key]: e.target.value })}
                      placeholder={platform.placeholder}
                      disabled={saving}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] transition-all disabled:opacity-60"
                    />
                    <p className="text-[10px] text-gray-400 mt-1">{platform.hint}</p>
                  </div>

                  {/* Status Dot */}
                  {socialValues[platform.key] && (
                    <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-green-400" title="Aktif" />
                  )}
                </div>
              ))}
            </div>

            <SaveButton saving={saving} label="Sosyal Medya Ayarlarını Kaydet" />
          </form>
        );

      // ═══ CONTENT TAB ═══
      case "content":
        return (
          <form onSubmit={handleContentSubmit} className="p-6 sm:p-8 space-y-6">
            <SettingsInput
              id="footer-description"
              label="Footer Açıklaması"
              value={footerDescription}
              onChange={setFooterDescription}
              disabled={saving}
              rows={3}
              placeholder="Özenle seçilmiş, %100 orijinal marka parfümlerden..."
              hint="Sitenin alt kısmında marka açıklaması olarak gösterilir"
            />
            <SettingsInput
              id="site-motto"
              label="Site Sloganı / Motto"
              value={siteMotto}
              onChange={setSiteMotto}
              disabled={saving}
              placeholder="Görünmez Ama Unutulmaz"
              hint="Footer ve hero bölümlerinde gösterilebilecek marka sloganı"
            />

            <SaveButton saving={saving} label="İçerik Ayarlarını Kaydet" />
          </form>
        );

      // ═══ LEGAL TAB ═══
      case "legal":
        return (
          <form onSubmit={handleLegalSubmit} className="p-6 sm:p-8 space-y-6">
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200/50">
              <div className="flex items-start gap-2.5">
                <svg viewBox="0 0 24 24" fill="none" stroke="#B45309" strokeWidth="2" className="w-5 h-5 flex-shrink-0 mt-0.5">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <p className="text-xs text-amber-800 leading-relaxed">
                  Bu metinler footer bölümündeki &quot;Gizlilik Politikası&quot; ve &quot;Kullanım Şartları&quot; açılır pencerelerinde gösterilecektir.
                  Paragraf ayıracı olarak boş satır kullanabilirsiniz. Her paragraf otomatik olarak biçimlendirilir.
                </p>
              </div>
            </div>

            <div>
              <label htmlFor="privacy-policy" className="block text-sm font-semibold text-gray-900 mb-1.5">
                Gizlilik Politikası
              </label>
              <textarea
                id="privacy-policy"
                rows={12}
                value={privacyPolicy}
                onChange={(e) => setPrivacyPolicy(e.target.value)}
                disabled={saving}
                placeholder={"Gizlilik ve Kişisel Verilerin Korunması Politikası\n\nReal Dekant olarak kişisel verilerinizin güvenliği konusunda azami hassasiyet göstermekteyiz...\n\n1. Toplanan Kişisel Veriler\n..."}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] transition-all disabled:opacity-60 resize-y min-h-[200px]"
              />
              <p className="mt-1.5 text-xs text-gray-500">Karakter: {privacyPolicy.length}</p>
            </div>

            <div className="h-px bg-gray-100" />

            <div>
              <label htmlFor="terms-of-use" className="block text-sm font-semibold text-gray-900 mb-1.5">
                Kullanım Şartları
              </label>
              <textarea
                id="terms-of-use"
                rows={12}
                value={termsOfUse}
                onChange={(e) => setTermsOfUse(e.target.value)}
                disabled={saving}
                placeholder={"Kullanım Şartları ve Koşulları\n\nBu web sitesini kullanarak aşağıdaki şartları kabul etmiş sayılırsınız...\n\n1. Genel Hükümler\n..."}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] transition-all disabled:opacity-60 resize-y min-h-[200px]"
              />
              <p className="mt-1.5 text-xs text-gray-500">Karakter: {termsOfUse.length}</p>
            </div>

            <SaveButton saving={saving} label="Yasal Sayfa İçeriklerini Kaydet" />
          </form>
        );

      default:
        return null;
    }
  };

  // ─── Main Render ───────────────────────────────────────────────────────────

  return (
    <div className="max-w-6xl mx-auto">
      {/* ─── Header ─────────────────────────────────────────────────────── */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Site Yönetim Paneli</h1>
        <p className="text-sm text-gray-500 mt-2">
          Mağaza, içerik, görünürlük ve yasal ayarları tek merkezden yönetin.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* ─── Tab Navigation ─────────────────────────────────────────────── */}
        <div className="md:col-span-1">
          {/* Horizontal scroll on mobile, vertical stack on desktop */}
          <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-250 flex-shrink-0 md:w-full text-left ${
                    isActive
                      ? "bg-[#111] text-white shadow-md shadow-gray-900/10 md:translate-x-1"
                      : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <span className={`transition-colors ${isActive ? "text-[#D4AF37]" : "text-gray-400"}`}>
                    {tab.icon}
                  </span>
                  {/* Desktop text showing label + brief description */}
                  <div className="hidden md:block min-w-0">
                    <div className="font-bold text-xs leading-none">{tab.label}</div>
                    <div className={`text-[10px] font-normal mt-1 leading-tight truncate ${isActive ? "text-gray-300" : "text-gray-400"}`}>
                      {tab.description}
                    </div>
                  </div>
                  {/* Mobile text showing label only */}
                  <span className="md:hidden">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ─── Active Tab Content Card ────────────────────────────────────── */}
        <div className="md:col-span-3 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden h-fit">
          {/* Tab Header */}
          <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-lg font-bold text-gray-900">
              {TABS.find((t) => t.key === activeTab)?.label}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {TABS.find((t) => t.key === activeTab)?.description}
            </p>
          </div>

          {/* Tab Body */}
          {renderTabContent()}
        </div>
      </div>

      {/* ─── Toast ──────────────────────────────────────────────────────── */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-5 py-3.5 rounded-xl shadow-2xl text-sm font-semibold transition-all animate-fade-in ${
            toast.type === "success"
              ? "bg-green-600 text-white"
              : "bg-red-600 text-white"
          }`}
          role="alert"
        >
          {toast.type === "success" ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5">
              <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          )}
          {toast.message}
        </div>
      )}
    </div>
  );
}
