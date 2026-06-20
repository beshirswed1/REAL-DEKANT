/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Product } from "@/types";


const GENDER_FILTER_OPTIONS = [
  { value: "all", label: "Tüm Cinsiyet" },
  { value: "male", label: "Erkek" },
  { value: "female", label: "Kadın" },
  { value: "unisex", label: "Unisex" },
];

const PUBLISH_FILTER_OPTIONS = [
  { value: "all", label: "Tüm Durum" },
  { value: "published", label: "Yayında" },
  { value: "draft", label: "Taslak" },
];

const AVAILABILITY_FILTER_OPTIONS = [
  { value: "all", label: "Tüm Stok" },
  { value: "in_stock", label: "Stokta" },
  { value: "out_of_stock", label: "Tükendi" },
  { value: "low_stock", label: "Az Stok (≤5)" },
  { value: "coming_soon", label: "Yakında" },
  { value: "limited", label: "Sınırlı" },
];

type SortField = "name" | "sku" | "brand" | "price" | "stock" | "createdAt";
type SortDir = "asc" | "desc";

const SORT_OPTIONS: { value: string; label: string; icon: string }[] = [
  { value: "createdAt_desc", label: "En Yeni", icon: "🕐" },
  { value: "createdAt_asc", label: "En Eski", icon: "🕐" },
  { value: "name_asc", label: "İsim (A → Z)", icon: "🔤" },
  { value: "name_desc", label: "İsim (Z → A)", icon: "🔤" },
  { value: "brand_asc", label: "Marka (A → Z)", icon: "🏷️" },
  { value: "brand_desc", label: "Marka (Z → A)", icon: "🏷️" },
  { value: "sku_asc", label: "SKU (Küçük → Büyük)", icon: "🔢" },
  { value: "sku_desc", label: "SKU (Büyük → Küçük)", icon: "🔢" },
  { value: "price_asc", label: "Fiyat (Düşük → Yüksek)", icon: "💰" },
  { value: "price_desc", label: "Fiyat (Yüksek → Düşük)", icon: "💰" },
  { value: "stock_asc", label: "Stok (Az → Çok)", icon: "📦" },
  { value: "stock_desc", label: "Stok (Çok → Az)", icon: "📦" },
];

const ITEMS_PER_PAGE = 20;

// ─── Props ────────────────────────────────────────────────────────────────────
interface ProductListClientProps {
  products: Product[];
}

// ─── Toast Component ──────────────────────────────────────────────────────────
function Toast({ message, type }: { message: string; type: "success" | "error" }) {
  return (
    <div className={`admin-toast ${type}`} role="alert">
      {type === "success" ? (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="15" y1="9" x2="9" y2="15" />
          <line x1="9" y1="9" x2="15" y2="15" />
        </svg>
      )}
      {message}
    </div>
  );
}

// ─── Confirm Dialog ───────────────────────────────────────────────────────────
function ConfirmDialog({
  title,
  message,
  confirmLabel,
  onConfirm,
  onCancel,
}: {
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="admin-dialog-overlay" onClick={onCancel} role="dialog" aria-modal="true">
      <div className="admin-dialog" onClick={(e) => e.stopPropagation()}>
        <h3>{title}</h3>
        <p>{message}</p>
        <div className="admin-dialog-btns">
          <button className="admin-btn-secondary" onClick={onCancel} type="button">
            İptal
          </button>
          <button className="admin-btn-danger" onClick={onConfirm} type="button">
            {confirmLabel || "Sil"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon, color }: { label: string; value: number; icon: string; color: string }) {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: "14px 18px",
      background: "#fff",
      border: "1px solid #f0ebe0",
      borderRadius: 14,
      flex: "1 1 0",
      minWidth: 130,
    }}>
      <div style={{
        width: 38,
        height: 38,
        borderRadius: 10,
        background: color,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 18,
        flexShrink: 0,
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 22, fontWeight: 700, color: "#1a1a1a", lineHeight: 1.1 }}>{value}</div>
        <div style={{ fontSize: 11, color: "#888", fontWeight: 500, marginTop: 2, whiteSpace: "nowrap" }}>{label}</div>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// PRODUCT LIST CLIENT
// ═════════════════════════════════════════════════════════════════════════════
export default function ProductListClient({ products: initialProducts }: ProductListClientProps) {
  const router = useRouter();

  // ─── State ──────────────────────────────────────────────────────────────────
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [search, setSearch] = useState("");
  const [genderFilter, setGenderFilter] = useState("all");
  const [publishFilter, setPublishFilter] = useState("all");
  const [availabilityFilter, setAvailabilityFilter] = useState("all");
  const [brandFilter, setBrandFilter] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt_desc");
  const [page, setPage] = useState(1);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    title: string;
    message: string;
    confirmLabel: string;
    action: () => Promise<void>;
  } | null>(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  // ─── Keyboard shortcut for search (Ctrl+K) ─────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  // ─── Distinct brands for brand filter ───────────────────────────────────────
  const brandOptions = useMemo(() => {
    const brands = new Set<string>();
    products.forEach((p) => {
      if (p.brand) brands.add(p.brand);
    });
    return Array.from(brands).sort((a, b) => a.localeCompare(b, "tr"));
  }, [products]);

  // ─── Stats ──────────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const total = products.length;
    const published = products.filter((p) => p.isPublished).length;
    const draft = total - published;
    const lowStock = products.filter((p) => (p.stock || 0) <= 5).length;
    return { total, published, draft, lowStock };
  }, [products]);

  // ─── Active filters count ──────────────────────────────────────────────────
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (genderFilter !== "all") count++;
    if (publishFilter !== "all") count++;
    if (availabilityFilter !== "all") count++;
    if (brandFilter !== "all") count++;
    return count;
  }, [genderFilter, publishFilter, availabilityFilter, brandFilter]);

  // ─── Filtered & Sorted Products ─────────────────────────────────────────────
  const filtered = useMemo(() => {
    let result = products;

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.brand.toLowerCase().includes(q) ||
          p.perfumeName.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          (p.tags || []).some((t) => t.toLowerCase().includes(q))
      );
    }

    // Gender filter
    if (genderFilter !== "all") {
      result = result.filter((p) => p.gender === genderFilter);
    }

    // Publish filter
    if (publishFilter === "published") {
      result = result.filter((p) => p.isPublished);
    } else if (publishFilter === "draft") {
      result = result.filter((p) => !p.isPublished);
    }

    // Availability filter
    if (availabilityFilter === "low_stock") {
      result = result.filter((p) => (p.stock || 0) <= 5 && (p.stock || 0) > 0);
    } else if (availabilityFilter !== "all") {
      result = result.filter((p) => p.availability === availabilityFilter);
    }

    // Brand filter
    if (brandFilter !== "all") {
      result = result.filter((p) => p.brand === brandFilter);
    }

    // Sort
    const [field, dir] = sortBy.split("_") as [SortField, SortDir];
    const multiplier = dir === "asc" ? 1 : -1;

    result = [...result].sort((a, b) => {
      switch (field) {
        case "name":
          return multiplier * a.perfumeName.localeCompare(b.perfumeName, "tr");
        case "brand":
          return multiplier * a.brand.localeCompare(b.brand, "tr");
        case "sku":
          return multiplier * a.sku.localeCompare(b.sku, "tr");
        case "price": {
          const pa = a.prices?.["3ml"] || 0;
          const pb = b.prices?.["3ml"] || 0;
          return multiplier * (pa - pb);
        }
        case "stock":
          return multiplier * ((a.stock || 0) - (b.stock || 0));
        case "createdAt": {
          const getTime = (t: any) => {
            if (!t) return 0;
            if (typeof t.toDate === "function") return t.toDate().getTime();
            if (t.seconds) return t.seconds * 1000;
            if (t._seconds) return t._seconds * 1000;
            return new Date(t).getTime() || 0;
          };
          return multiplier * (getTime(a.createdAt) - getTime(b.createdAt));
        }
        default:
          return 0;
      }
    });

    return result;
  }, [products, search, genderFilter, publishFilter, availabilityFilter, brandFilter, sortBy]);

  // ─── Pagination ─────────────────────────────────────────────────────────────
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginatedProducts = filtered.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  // Reset page when filters change
  const resetPage = () => setPage(1);

  const handleSearchChange = (val: string) => {
    setSearch(val);
    resetPage();
  };

  const handleFilterChange = (setter: (val: string) => void) => (val: string) => {
    setter(val);
    resetPage();
  };

  const clearAllFilters = () => {
    setSearch("");
    setGenderFilter("all");
    setPublishFilter("all");
    setAvailabilityFilter("all");
    setBrandFilter("all");
    setSortBy("createdAt_desc");
    resetPage();
  };

  // ─── Show toast with auto-hide ──────────────────────────────────────────────
  const showToast = useCallback((message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // ─── Toggle Published (optimistic) ─────────────────────────────────────────
  const togglePublished = async (product: Product) => {
    const newValue = !product.isPublished;

    // Optimistic update
    setProducts((prev) =>
      prev.map((p) => (p.id === product.id ? { ...p, isPublished: newValue } : p))
    );

    try {
      const res = await fetch("/api/admin/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: product.id, isPublished: newValue }),
      });

      if (!res.ok) throw new Error();
      showToast(newValue ? "Ürün yayınlandı" : "Ürün taslağa alındı", "success");
    } catch {
      // Revert
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, isPublished: !newValue } : p))
      );
      showToast("İşlem başarısız", "error");
    }
  };

  // ─── Delete Single ─────────────────────────────────────────────────────────
  const deleteSingle = (product: Product) => {
    setConfirmAction({
      title: "Ürünü Sil",
      message: `"${product.perfumeName}" kalıcı olarak silinecek. Bu işlem geri alınamaz.`,
      confirmLabel: "Sil",
      action: async () => {
        try {
          const res = await fetch("/api/admin/products", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: product.id }),
          });

          if (!res.ok) throw new Error();

          setProducts((prev) => prev.filter((p) => p.id !== product.id));
          showToast("Ürün silindi", "success");
        } catch {
          showToast("Silme başarısız", "error");
        } finally {
          setConfirmAction(null);
        }
      },
    });
  };

  // ─── Format price ───────────────────────────────────────────────────────────
  const fmtPrice = (p: number) => {
    if (!p) return "—";
    return `₺${p.toLocaleString("tr-TR")}`;
  };

  // ─── Get thumbnail URL ─────────────────────────────────────────────────────
  const getThumb = (product: Product): string => {
    const first = product.images?.[0];
    if (!first) return "";
    if (typeof first === "string") return first;
    return (first as any).url || "";
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <>
      {/* ─── Header ─────────────────────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "#1a1a1a", letterSpacing: "-0.02em", margin: 0 }}>Ürünler</h1>
          <p style={{ fontSize: 13, color: "#888", marginTop: 4, margin: 0 }}>
            Ürünlerinizi yönetin, düzenleyin ve filtreleyin
          </p>
        </div>
        <Link
          href="/admin/products/new"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 20px",
            background: "linear-gradient(135deg, #D4AF37, #B8960C)",
            color: "#fff",
            fontSize: 13,
            fontWeight: 600,
            borderRadius: 12,
            textDecoration: "none",
            boxShadow: "0 2px 8px rgba(212,175,55,0.25)",
            transition: "all 0.2s",
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: 18, height: 18 }}>
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Yeni Ürün Ekle
        </Link>
      </div>

      {/* ─── Stats Row ──────────────────────────────────────────────────── */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <StatCard label="Toplam Ürün" value={stats.total} icon="📦" color="rgba(212,175,55,0.1)" />
        <StatCard label="Yayında" value={stats.published} icon="✅" color="rgba(34,197,94,0.1)" />
        <StatCard label="Taslak" value={stats.draft} icon="📝" color="rgba(234,179,8,0.1)" />
        <StatCard label="Az Stok" value={stats.lowStock} icon="⚠️" color="rgba(239,68,68,0.1)" />
      </div>

      {/* ─── Search + Sort Bar ───────────────────────────────────────────── */}
      <div style={{
        display: "flex",
        gap: 12,
        marginBottom: 12,
        alignItems: "stretch",
        flexWrap: "wrap",
      }}>
        {/* Search */}
        <div style={{ position: "relative", flex: "1 1 300px", minWidth: 200 }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{
            position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)",
            width: 16, height: 16, color: "#aaa", pointerEvents: "none",
          }}>
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            ref={searchRef}
            type="text"
            style={{
              width: "100%",
              padding: "11px 44px 11px 40px",
              background: "#fff",
              border: "1px solid #e8e3d8",
              borderRadius: 12,
              fontSize: 13,
              color: "#1a1a1a",
              outline: "none",
              transition: "border-color 0.2s, box-shadow 0.2s",
            }}
            placeholder="Marka, ürün adı, SKU veya etiket ara..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "#D4AF37";
              e.currentTarget.style.boxShadow = "0 0 0 3px rgba(212,175,55,0.1)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "#e8e3d8";
              e.currentTarget.style.boxShadow = "none";
            }}
            aria-label="Ürün ara"
          />
          {/* Clear search */}
          {search && (
            <button
              type="button"
              onClick={() => handleSearchChange("")}
              style={{
                position: "absolute", right: 38, top: "50%", transform: "translateY(-50%)",
                background: "none", border: "none", cursor: "pointer", padding: 4,
                color: "#aaa", fontSize: 16, lineHeight: 1, display: "flex",
              }}
              aria-label="Aramayı temizle"
            >
              ×
            </button>
          )}
          {/* Ctrl+K hint */}
          <kbd style={{
            position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
            fontSize: 10, fontWeight: 600, color: "#bbb", background: "#f5f3ed",
            padding: "2px 6px", borderRadius: 4, border: "1px solid #e8e3d8",
            fontFamily: "monospace", pointerEvents: "none",
          }}>
            Ctrl+K
          </kbd>
        </div>

        {/* Sort Dropdown */}
        <div style={{ position: "relative", minWidth: 220 }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{
            position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
            width: 15, height: 15, color: "#aaa", pointerEvents: "none",
          }}>
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="6" y1="12" x2="18" y2="12" />
            <line x1="8" y1="18" x2="16" y2="18" />
          </svg>
          <select
            style={{
              width: "100%",
              padding: "11px 12px 11px 34px",
              background: "#fff",
              border: "1px solid #e8e3d8",
              borderRadius: 12,
              fontSize: 13,
              fontWeight: 500,
              color: "#444",
              outline: "none",
              cursor: "pointer",
              appearance: "none",
              WebkitAppearance: "none",
              transition: "border-color 0.2s",
            }}
            value={sortBy}
            onChange={(e) => { setSortBy(e.target.value); resetPage(); }}
            aria-label="Sıralama"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.icon}  {opt.label}
              </option>
            ))}
          </select>
          {/* Custom dropdown arrow */}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{
            position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
            width: 14, height: 14, color: "#999", pointerEvents: "none",
          }}>
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>

        {/* Advanced Filter Toggle */}
        <button
          type="button"
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "11px 16px",
            background: showAdvancedFilters ? "rgba(212,175,55,0.08)" : "#fff",
            border: `1px solid ${showAdvancedFilters ? "#D4AF37" : "#e8e3d8"}`,
            borderRadius: 12,
            fontSize: 13,
            fontWeight: 500,
            color: showAdvancedFilters ? "#B8960C" : "#666",
            cursor: "pointer",
            transition: "all 0.2s",
            whiteSpace: "nowrap",
            position: "relative",
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 15, height: 15 }}>
            <line x1="4" y1="21" x2="4" y2="14" />
            <line x1="4" y1="10" x2="4" y2="3" />
            <line x1="12" y1="21" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12" y2="3" />
            <line x1="20" y1="21" x2="20" y2="16" />
            <line x1="20" y1="12" x2="20" y2="3" />
            <line x1="1" y1="14" x2="7" y2="14" />
            <line x1="9" y1="8" x2="15" y2="8" />
            <line x1="17" y1="16" x2="23" y2="16" />
          </svg>
          Filtreler
          {activeFilterCount > 0 && (
            <span style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 18,
              height: 18,
              borderRadius: "50%",
              background: "#D4AF37",
              color: "#fff",
              fontSize: 10,
              fontWeight: 700,
              lineHeight: 1,
            }}>
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* ─── Advanced Filters Panel ─────────────────────────────────────── */}
      {showAdvancedFilters && (
        <div style={{
          padding: "16px 20px",
          background: "#faf8f2",
          border: "1px solid #f0ebe0",
          borderRadius: 14,
          marginBottom: 16,
          animation: "slideDown 0.2s ease-out",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#888", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Gelişmiş Filtreler
            </span>
            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={clearAllFilters}
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  color: "#D4AF37",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "4px 8px",
                  borderRadius: 6,
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(212,175,55,0.08)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
              >
                Tümünü Temizle
              </button>
            )}
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {/* Gender */}
            <FilterSelect
              label="Cinsiyet"
              value={genderFilter}
              onChange={handleFilterChange(setGenderFilter)}
              options={GENDER_FILTER_OPTIONS}
            />
            {/* Publish Status */}
            <FilterSelect
              label="Yayın Durumu"
              value={publishFilter}
              onChange={handleFilterChange(setPublishFilter)}
              options={PUBLISH_FILTER_OPTIONS}
            />
            {/* Availability */}
            <FilterSelect
              label="Stok Durumu"
              value={availabilityFilter}
              onChange={handleFilterChange(setAvailabilityFilter)}
              options={AVAILABILITY_FILTER_OPTIONS}
            />
            {/* Brand */}
            <FilterSelect
              label="Marka"
              value={brandFilter}
              onChange={handleFilterChange(setBrandFilter)}
              options={[
                { value: "all", label: "Tüm Markalar" },
                ...brandOptions.map((b) => ({ value: b, label: b })),
              ]}
            />
          </div>
        </div>
      )}

      {/* ─── Active Filter Tags ──────────────────────────────────────────── */}
      {(search || activeFilterCount > 0) && (
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 14,
          flexWrap: "wrap",
        }}>
          <span style={{ fontSize: 12, color: "#888", fontWeight: 500 }}>
            {filtered.length} sonuç
          </span>
          <span style={{ width: 1, height: 14, background: "#e0ddd4" }} />
          {search && (
            <FilterTag
              label={`"${search}"`}
              onClear={() => handleSearchChange("")}
            />
          )}
          {genderFilter !== "all" && (
            <FilterTag
              label={GENDER_FILTER_OPTIONS.find((o) => o.value === genderFilter)?.label || genderFilter}
              onClear={() => setGenderFilter("all")}
            />
          )}
          {publishFilter !== "all" && (
            <FilterTag
              label={PUBLISH_FILTER_OPTIONS.find((o) => o.value === publishFilter)?.label || publishFilter}
              onClear={() => setPublishFilter("all")}
            />
          )}
          {availabilityFilter !== "all" && (
            <FilterTag
              label={AVAILABILITY_FILTER_OPTIONS.find((o) => o.value === availabilityFilter)?.label || availabilityFilter}
              onClear={() => setAvailabilityFilter("all")}
            />
          )}
          {brandFilter !== "all" && (
            <FilterTag
              label={brandFilter}
              onClear={() => setBrandFilter("all")}
            />
          )}
        </div>
      )}

      {/* ─── Table ──────────────────────────────────────────────────────── */}
      <div style={{
        background: "#fff",
        borderRadius: 16,
        border: "1px solid #f0ebe0",
        overflow: "hidden",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
      }}>
        <div style={{ overflowX: "auto" }}>
          {paginatedProducts.length === 0 ? (
            <div style={{ padding: 48, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <div style={{
                width: 56, height: 56, background: "#faf8f2", borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16,
                fontSize: 24,
              }}>
                {search ? "🔍" : "📦"}
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: "#1a1a1a", margin: "0 0 4px 0" }}>
                {search ? "Sonuç bulunamadı" : "Henüz ürün bulunmuyor"}
              </h3>
              <p style={{ color: "#888", fontSize: 13, margin: 0 }}>
                {search
                  ? "Farklı anahtar kelimelerle aramayı deneyin veya filtreleri temizleyin."
                  : "Yeni bir ürün ekleyerek başlayabilirsiniz."}
              </p>
              {(search || activeFilterCount > 0) && (
                <button
                  type="button"
                  onClick={clearAllFilters}
                  style={{
                    marginTop: 16,
                    padding: "8px 20px",
                    background: "rgba(212,175,55,0.08)",
                    border: "1px solid rgba(212,175,55,0.2)",
                    borderRadius: 10,
                    color: "#B8960C",
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: "pointer",
                  }}
                >
                  Filtreleri Temizle
                </button>
              )}
            </div>
          ) : (
            <table style={{ width: "100%", textAlign: "left", fontSize: 13, borderCollapse: "collapse", whiteSpace: "nowrap" }}>
              <thead>
                <tr style={{ background: "#faf8f2", borderBottom: "1px solid #f0ebe0" }}>
                  <th style={thStyle}>Ürün</th>
                  <th style={{ ...thStyle, width: 80 }}>SKU</th>
                  <th style={{ ...thStyle, width: 160 }}>Fiyatlar</th>
                  <th style={{ ...thStyle, width: 70 }}>Stok</th>
                  <th style={{ ...thStyle, width: 90 }}>Durum</th>
                  <th style={{ ...thStyle, width: 90, textAlign: "right" }}>İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {paginatedProducts.map((product) => {
                  const thumb = getThumb(product);
                  const prices = product.prices || {};

                  return (
                    <tr
                      key={product.id}
                      style={{
                        borderBottom: "1px solid #f5f3ed",
                        transition: "background 0.15s",
                        cursor: "pointer",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#faf8f2")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      onClick={() => router.push(`/admin/products/${product.id}/edit`)}
                    >
                      <td style={tdStyle}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          {thumb ? (
                            <img
                              src={thumb}
                              alt={product.perfumeName}
                              style={{
                                width: 48, height: 48, borderRadius: 10, objectFit: "cover",
                                border: "1px solid #f0ebe0", flexShrink: 0,
                              }}
                            />
                          ) : (
                            <div style={{
                              width: 48, height: 48, borderRadius: 10, background: "#faf8f2",
                              border: "1px solid #f0ebe0", display: "flex", alignItems: "center",
                              justifyContent: "center", fontSize: 20, flexShrink: 0,
                            }}>
                              🧴
                            </div>
                          )}
                          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", minWidth: 0 }}>
                            <span style={{ fontWeight: 700, color: "#1a1a1a", fontSize: 13 }}>{product.brand}</span>
                            <span style={{ color: "#666", fontWeight: 500, fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", maxWidth: 220 }}>
                              {product.perfumeName}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td style={tdStyle}>
                        <span style={{
                          fontSize: 11, fontWeight: 600, color: "#999", fontFamily: "monospace",
                          background: "#f5f3ed", padding: "3px 7px", borderRadius: 6,
                        }}>
                          {product.sku}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 500 }}>
                          <span style={priceChipStyle}>3ml: <b style={{ color: "#1a1a1a" }}>{fmtPrice(prices["3ml"])}</b></span>
                          <span style={priceChipStyle}>5ml: <b style={{ color: "#1a1a1a" }}>{fmtPrice(prices["5ml"])}</b></span>
                          <span style={priceChipStyle}>10ml: <b style={{ color: "#1a1a1a" }}>{fmtPrice(prices["10ml"])}</b></span>
                        </div>
                      </td>
                      <td style={tdStyle}>
                        <div style={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          minWidth: 32,
                          height: 28,
                          padding: "0 10px",
                          borderRadius: 8,
                          fontSize: 13,
                          fontWeight: 700,
                          border: "1px solid",
                          ...(
                            (product.stock || 0) === 0
                              ? { background: "#fef2f2", color: "#dc2626", borderColor: "#fee2e2" }
                              : (product.stock || 0) <= 5
                                ? { background: "#fffbeb", color: "#d97706", borderColor: "#fef3c7" }
                                : { background: "#f0fdf4", color: "#16a34a", borderColor: "#dcfce7" }
                          ),
                        }}>
                          {product.stock ?? 0}
                        </div>
                      </td>
                      <td style={tdStyle} onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => togglePublished(product)}
                          style={{
                            padding: "6px 12px",
                            borderRadius: 8,
                            border: "none",
                            fontSize: 11,
                            fontWeight: 600,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: 5,
                            transition: "all 0.15s",
                            ...(product.isPublished
                              ? { background: "#f0fdf4", color: "#16a34a" }
                              : { background: "#f5f3ed", color: "#999" }),
                          }}
                          aria-label={`${product.perfumeName} görünürlüğü değiştir`}
                        >
                          {product.isPublished ? (
                            <>
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: 14, height: 14 }}>
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                <circle cx="12" cy="12" r="3" />
                              </svg>
                              Yayında
                            </>
                          ) : (
                            <>
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: 14, height: 14 }}>
                                <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                                <line x1="1" y1="1" x2="23" y2="23" />
                              </svg>
                              Taslak
                            </>
                          )}
                        </button>
                      </td>
                      <td style={{ ...tdStyle, textAlign: "right" }} onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 2 }}>
                          <button
                            style={actionBtnStyle}
                            onClick={() => router.push(`/admin/products/${product.id}/edit`)}
                            aria-label={`${product.perfumeName} düzenle`}
                            type="button"
                            onMouseEnter={(e) => {
                              e.currentTarget.style.color = "#D4AF37";
                              e.currentTarget.style.background = "rgba(212,175,55,0.08)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.color = "#bbb";
                              e.currentTarget.style.background = "transparent";
                            }}
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16 }}>
                              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </button>
                          <button
                            style={actionBtnStyle}
                            onClick={() => deleteSingle(product)}
                            aria-label={`${product.perfumeName} sil`}
                            type="button"
                            onMouseEnter={(e) => {
                              e.currentTarget.style.color = "#ef4444";
                              e.currentTarget.style.background = "rgba(239,68,68,0.06)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.color = "#bbb";
                              e.currentTarget.style.background = "transparent";
                            }}
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16 }}>
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {/* ─── Pagination ─────────────────────────────────────────────── */}
          {totalPages > 1 && (
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 20px",
              background: "#faf8f2",
              borderTop: "1px solid #f0ebe0",
            }}>
              <span style={{ fontSize: 13, color: "#888", fontWeight: 500 }}>
                {(page - 1) * ITEMS_PER_PAGE + 1} – {Math.min(page * ITEMS_PER_PAGE, filtered.length)}
                <span style={{ margin: "0 4px" }}>/</span>
                {filtered.length}
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                {/* First page */}
                <PaginationBtn
                  onClick={() => setPage(1)}
                  disabled={page === 1}
                  label="İlk"
                >
                  «
                </PaginationBtn>
                {/* Previous */}
                <PaginationBtn
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  label="Önceki"
                >
                  ‹
                </PaginationBtn>
                {/* Page numbers */}
                {getPageNumbers(page, totalPages).map((p, i) =>
                  p === "..." ? (
                    <span key={`ellipsis-${i}`} style={{ padding: "0 6px", fontSize: 13, color: "#ccc" }}>…</span>
                  ) : (
                    <PaginationBtn
                      key={p}
                      onClick={() => setPage(p as number)}
                      disabled={false}
                      active={page === p}
                      label={`Sayfa ${p}`}
                    >
                      {p}
                    </PaginationBtn>
                  )
                )}
                {/* Next */}
                <PaginationBtn
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  label="Sonraki"
                >
                  ›
                </PaginationBtn>
                {/* Last page */}
                <PaginationBtn
                  onClick={() => setPage(totalPages)}
                  disabled={page === totalPages}
                  label="Son"
                >
                  »
                </PaginationBtn>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── Toast ──────────────────────────────────────────────────────── */}
      {toast && <Toast message={toast.message} type={toast.type} />}

      {/* ─── Confirm Dialog ─────────────────────────────────────────────── */}
      {confirmAction && (
        <ConfirmDialog
          title={confirmAction.title}
          message={confirmAction.message}
          confirmLabel={confirmAction.confirmLabel}
          onConfirm={confirmAction.action}
          onCancel={() => setConfirmAction(null)}
        />
      )}

      <style jsx>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// HELPER COMPONENTS
// ═════════════════════════════════════════════════════════════════════════════

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div style={{ flex: "1 1 160px", minWidth: 140 }}>
      <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#888", marginBottom: 5, letterSpacing: "0.04em" }}>
        {label}
      </label>
      <select
        style={{
          width: "100%",
          padding: "9px 12px",
          background: "#fff",
          border: "1px solid #e8e3d8",
          borderRadius: 10,
          fontSize: 13,
          fontWeight: 500,
          color: value === "all" ? "#888" : "#1a1a1a",
          outline: "none",
          cursor: "pointer",
          transition: "border-color 0.2s",
        }}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function FilterTag({ label, onClear }: { label: string; onClear: () => void }) {
  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 4,
      padding: "4px 10px",
      background: "rgba(212,175,55,0.08)",
      border: "1px solid rgba(212,175,55,0.15)",
      borderRadius: 20,
      fontSize: 12,
      fontWeight: 500,
      color: "#B8960C",
    }}>
      {label}
      <button
        type="button"
        onClick={onClear}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: 0,
          marginLeft: 2,
          fontSize: 14,
          lineHeight: 1,
          color: "#D4AF37",
          display: "flex",
        }}
        aria-label={`${label} filtresini kaldır`}
      >
        ×
      </button>
    </span>
  );
}

function PaginationBtn({
  children,
  onClick,
  disabled,
  active,
  label,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled: boolean;
  active?: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      style={{
        minWidth: 32,
        height: 32,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 8px",
        fontSize: 13,
        fontWeight: active ? 700 : 500,
        color: active ? "#fff" : disabled ? "#ccc" : "#666",
        background: active ? "#D4AF37" : "#fff",
        border: `1px solid ${active ? "#D4AF37" : "#e8e3d8"}`,
        borderRadius: 8,
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "all 0.15s",
        opacity: disabled ? 0.5 : 1,
      }}
    >
      {children}
    </button>
  );
}

// ─── Page number logic ──────────────────────────────────────────────────────
function getPageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | "...")[] = [1];

  if (current > 3) pages.push("...");

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  for (let i = start; i <= end; i++) pages.push(i);

  if (current < total - 2) pages.push("...");

  pages.push(total);
  return pages;
}

// ─── Style constants ────────────────────────────────────────────────────────
const thStyle: React.CSSProperties = {
  padding: "12px 16px",
  fontWeight: 600,
  color: "#999",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  fontSize: 11,
};

const tdStyle: React.CSSProperties = {
  padding: "12px 16px",
};

const priceChipStyle: React.CSSProperties = {
  background: "#f5f3ed",
  border: "1px solid #ebe8de",
  color: "#888",
  padding: "3px 7px",
  borderRadius: 6,
};

const actionBtnStyle: React.CSSProperties = {
  padding: 8,
  color: "#bbb",
  background: "transparent",
  border: "none",
  borderRadius: 8,
  cursor: "pointer",
  transition: "all 0.15s",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};
