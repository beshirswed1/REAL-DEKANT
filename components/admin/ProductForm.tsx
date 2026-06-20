/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { uploadToImgBB } from "@/lib/imgbb/config";
import type { Product, ProductImage, Gender, Concentration, Availability } from "@/types";

// ─── Constants ────────────────────────────────────────────────────────────────
const SCENT_FAMILIES = [
  "Çiçeksi", "Odunsu", "Oryantal", "Fresh", "Baharatlı", "Gourmand", "Misk", "Deri",
];
const SEASONS = ["Yaz", "Kış", "İlkbahar", "Sonbahar"];
const TIMES = ["Gündüz", "Gece", "Her Zaman"];
const LONGEVITY_OPTIONS = ["Zayıf", "Orta", "Güçlü", "Canavar"];
const SILLAGE_OPTIONS = ["Hafif", "Orta", "Güçlü", "Yoğun"];
const CONCENTRATION_OPTIONS: { value: Concentration; label: string }[] = [
  { value: "EDP", label: "Eau de Parfum (EDP)" },
  { value: "EDT", label: "Eau de Toilette (EDT)" },
  { value: "Parfum", label: "Parfum" },
  { value: "EDC", label: "Eau de Cologne (EDC)" },
];
const AVAILABILITY_OPTIONS: { value: Availability; label: string }[] = [
  { value: "in_stock", label: "Stokta Var" },
  { value: "out_of_stock", label: "Tükendi" },
  { value: "coming_soon", label: "Yakında" },
  { value: "limited", label: "Sınırlı Stok" },
];
const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: "male", label: "Erkek" },
  { value: "female", label: "Kadın" },
  { value: "unisex", label: "Unisex" },
];

// ─── Props ────────────────────────────────────────────────────────────────────
interface ProductFormProps {
  product?: Product;
  brands?: string[];
}

// ─── Toast Component ──────────────────────────────────────────────────────────
function Toast({ message, type, onClose }: { message: string; type: "success" | "error"; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);

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
  onConfirm,
  onCancel,
}: {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    cancelRef.current?.focus();
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onCancel]);

  return (
    <div className="admin-dialog-overlay" onClick={onCancel} role="dialog" aria-modal="true" aria-labelledby="dialog-title">
      <div className="admin-dialog" onClick={(e) => e.stopPropagation()}>
        <h3 id="dialog-title">{title}</h3>
        <p>{message}</p>
        <div className="admin-dialog-btns">
          <button ref={cancelRef} className="admin-btn-secondary" onClick={onCancel} type="button">
            İptal
          </button>
          <button className="admin-btn-danger" onClick={onConfirm} type="button">
            Sil
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Tag Input Component ──────────────────────────────────────────────────────
function TagInput({
  tags,
  onChange,
  placeholder,
  label,
}: {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  label?: string;
}) {
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const addTag = (tag: string) => {
    const trimmed = tag.trim();
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
    }
    setInput("");
  };

  const removeTag = (index: number) => {
    onChange(tags.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(input);
    } else if (e.key === "Backspace" && input === "" && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  };

  return (
    <div className="admin-field">
      {label && <label>{label}</label>}
      <div
        className="admin-tag-input-wrapper"
        onClick={() => inputRef.current?.focus()}
      >
        {tags.map((tag, i) => (
          <span key={`${tag}-${i}`} className="admin-tag">
            {tag}
            <button
              type="button"
              onClick={() => removeTag(i)}
              aria-label={`${tag} etiketini kaldır`}
            >
              ×
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          className="admin-tag-input"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => { if (input.trim()) addTag(input); }}
          placeholder={tags.length === 0 ? placeholder : ""}
          aria-label={label || placeholder}
        />
      </div>
    </div>
  );
}

// ─── Brand Autocomplete ───────────────────────────────────────────────────────
function BrandAutocomplete({
  value,
  onChange,
  brands,
}: {
  value: string;
  onChange: (val: string) => void;
  brands: string[];
}) {
  const [showList, setShowList] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const filtered = value
    ? brands.filter((b) => b.toLowerCase().includes(value.toLowerCase()))
    : brands;

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowList(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((prev) => Math.min(prev + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && highlightIndex >= 0) {
      e.preventDefault();
      onChange(filtered[highlightIndex]);
      setShowList(false);
    } else if (e.key === "Escape") {
      setShowList(false);
    }
  };

  return (
    <div className="admin-field admin-autocomplete" ref={wrapperRef}>
      <label htmlFor="product-brand">
        Marka <span className="required">*</span>
      </label>
      <input
        id="product-brand"
        type="text"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setShowList(true);
          setHighlightIndex(-1);
        }}
        onFocus={() => setShowList(true)}
        onKeyDown={handleKeyDown}
        placeholder="Marka adını yazın..."
        autoComplete="off"
      />
      {showList && filtered.length > 0 && (
        <div className="admin-autocomplete-list" role="listbox">
          {filtered.slice(0, 10).map((brand, i) => (
            <div
              key={brand}
              className={`admin-autocomplete-item ${i === highlightIndex ? "highlighted" : ""}`}
              role="option"
              aria-selected={i === highlightIndex}
              onClick={() => {
                onChange(brand);
                setShowList(false);
              }}
              onMouseEnter={() => setHighlightIndex(i)}
            >
              {brand}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// MAIN PRODUCT FORM COMPONENT
// ═════════════════════════════════════════════════════════════════════════════
export default function ProductForm({ product, brands = [] }: ProductFormProps) {
  const router = useRouter();
  const isEditing = !!product;

  // ─── Form State ─────────────────────────────────────────────────────────────
  const [sku, setSku] = useState(product?.sku || "");
  const [brand, setBrand] = useState(product?.brand || "");
  const [perfumeName, setPerfumeName] = useState(product?.perfumeName || "");
  const [gender, setGender] = useState<Gender>(product?.gender || "unisex");
  const [concentration, setConcentration] = useState<Concentration>(product?.concentration || "EDP");

  // Prices
  const [price3ml, setPrice3ml] = useState(product?.prices?.["3ml"]?.toString() || "");
  const [price5ml, setPrice5ml] = useState(product?.prices?.["5ml"]?.toString() || "");
  const [price10ml, setPrice10ml] = useState(product?.prices?.["10ml"]?.toString() || "");
  const [compare3ml, setCompare3ml] = useState(product?.compareAtPrices?.["3ml"]?.toString() || "");
  const [compare5ml, setCompare5ml] = useState(product?.compareAtPrices?.["5ml"]?.toString() || "");
  const [compare10ml, setCompare10ml] = useState(product?.compareAtPrices?.["10ml"]?.toString() || "");
  const [stock, setStock] = useState(product?.stock?.toString() || "0");
  const [availability, setAvailability] = useState<Availability>(product?.availability || "in_stock");

  // Scent Profile
  const [scentFamily, setScentFamily] = useState<string[]>(product?.scentFamily || []);
  const [season, setSeason] = useState<string[]>(product?.season || []);
  const [timeOfDay, setTimeOfDay] = useState<string[]>(product?.timeOfDay || []);
  const [longevity, setLongevity] = useState(product?.longevity || "Orta");
  const [sillage, setSillage] = useState(product?.sillage || "Orta");
  const [topNotes, setTopNotes] = useState<string[]>(product?.notes?.top || []);
  const [heartNotes, setHeartNotes] = useState<string[]>(product?.notes?.heart || []);
  const [baseNotes, setBaseNotes] = useState<string[]>(product?.notes?.base || []);

  // Images
  const [images, setImages] = useState<ProductImage[]>(
    product?.images || []
  );
  const [uploading, setUploading] = useState(false);

  // Publishing
  const [isPublished, setIsPublished] = useState(product?.isPublished ?? false);
  const [isFeatured, setIsFeatured] = useState(product?.isFeatured ?? false);
  const [isNew, setIsNew] = useState(product?.isNew ?? false);
  const [tags, setTags] = useState<string[]>(product?.tags || []);
  const [adminNote, setAdminNote] = useState(product?.adminNote || "");

  // UI State
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Drag state for images
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // ─── Auto-generate SKU ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!isEditing && !sku) {
      const genderCode = gender === "male" ? "M" : gender === "female" ? "F" : "U";
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      setSku(`RD-${genderCode}-${randomNum}`);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gender, isEditing]);

  // ─── Unsaved changes warning ────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, []);

  // ─── Validation ─────────────────────────────────────────────────────────────
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!brand.trim()) newErrors.brand = "Marka gerekli";
    if (!perfumeName.trim()) newErrors.perfumeName = "Parfüm adı gerekli";
    if (!price3ml || parseFloat(price3ml) <= 0) newErrors.price3ml = "3ml fiyat gerekli";
    if (!price5ml || parseFloat(price5ml) <= 0) newErrors.price5ml = "5ml fiyat gerekli";
    if (!price10ml || parseFloat(price10ml) <= 0) newErrors.price10ml = "10ml fiyat gerekli";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ─── Image Upload ──────────────────────────────────────────────────────────
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const newImages: ProductImage[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        // Validate file type
        if (!file.type.startsWith("image/")) continue;
        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          setToast({ message: `${file.name} 5MB'den büyük`, type: "error" });
          continue;
        }

        const result = await uploadToImgBB(file, perfumeName || brand || file.name);
        newImages.push({
          url: result.url,
          publicId: result.id,
          alt: perfumeName || brand || "Ürün görseli",
        });
      }

      setImages((prev) => [...prev, ...newImages]);
      if (newImages.length > 0) {
        setToast({ message: `${newImages.length} görsel yüklendi`, type: "success" });
      }
    } catch (err) {
      console.error("Upload error:", err);
      setToast({ message: "Görsel yükleme hatası", type: "error" });
    } finally {
      setUploading(false);
      // Reset input
      e.target.value = "";
    }
  };

  // ─── Image Remove ──────────────────────────────────────────────────────────
  const handleImageRemove = (index: number) => {
    // ImgBB images are removed from state only (no server-side delete API required)
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  // ─── Image Drag & Drop Reorder ─────────────────────────────────────────────
  const handleDragStart = (index: number) => {
    setDragIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDrop = (index: number) => {
    if (dragIndex === null || dragIndex === index) return;
    const reordered = [...images];
    const [moved] = reordered.splice(dragIndex, 1);
    reordered.splice(index, 0, moved);
    setImages(reordered);
    setDragIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
    setDragOverIndex(null);
  };

  // ─── Chip Toggle ────────────────────────────────────────────────────────────
  const toggleChip = useCallback((arr: string[], setArr: React.Dispatch<React.SetStateAction<string[]>>, val: string) => {
    setArr(arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val]);
  }, []);

  // ─── Save ───────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!validate()) {
      setToast({ message: "Lütfen gerekli alanları doldurun", type: "error" });
      return;
    }

    setSaving(true);

    const productData = {
      ...(isEditing ? { id: product!.id } : {}),
      sku,
      brand: brand.trim(),
      perfumeName: perfumeName.trim(),
      gender,
      concentration,
      prices: {
        "3ml": parseFloat(price3ml) || 0,
        "5ml": parseFloat(price5ml) || 0,
        "10ml": parseFloat(price10ml) || 0,
      },
      compareAtPrices: {
        "3ml": compare3ml ? parseFloat(compare3ml) : undefined,
        "5ml": compare5ml ? parseFloat(compare5ml) : undefined,
        "10ml": compare10ml ? parseFloat(compare10ml) : undefined,
      },
      availability,
      stock: parseInt(stock) || 0,
      scentFamily,
      notes: { top: topNotes, heart: heartNotes, base: baseNotes },
      longevity,
      sillage,
      season,
      timeOfDay,
      images,
      isPublished,
      isFeatured,
      isNew,
      tags,
      adminNote: adminNote.trim(),
    };

    try {
      const res = await fetch("/api/admin/products", {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Kaydetme başarısız");
      }

      setToast({ message: isEditing ? "Ürün güncellendi" : "Ürün oluşturuldu", type: "success" });

      // Redirect after short delay
      setTimeout(() => {
        router.push("/admin/products");
        router.refresh();
      }, 1200);
    } catch (err: any) {
      setToast({ message: err.message || "Bir hata oluştu", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  // ─── Delete ─────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!isEditing) return;
    setSaving(true);

    try {
      const res = await fetch("/api/admin/products", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: product!.id }),
      });

      if (!res.ok) {
        throw new Error("Silme başarısız");
      }

      setToast({ message: "Ürün silindi", type: "success" });
      setTimeout(() => {
        router.push("/admin/products");
        router.refresh();
      }, 1200);
    } catch (err: any) {
      setToast({ message: err.message, type: "error" });
    } finally {
      setSaving(false);
      setShowDeleteConfirm(false);
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div className="admin-form">
      {/* ─── SECTION 1: Temel Bilgiler ────────────────────────────────────── */}
      <section className="admin-form-section" aria-labelledby="section-1-title">
        <div className="admin-form-section-header">
          <span className="admin-form-section-number">1</span>
          <h2 id="section-1-title">Temel Bilgiler</h2>
        </div>
        <div className="admin-form-section-body">
          <div className="admin-form-grid">
            {/* SKU */}
            <div className="admin-field">
              <label htmlFor="product-sku">SKU</label>
              <input
                id="product-sku"
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="RD-M-1234"
              />
              <span className="field-hint">Otomatik oluşturulur, gerekirse değiştirin</span>
            </div>

            {/* Brand Autocomplete */}
            <BrandAutocomplete
              value={brand}
              onChange={setBrand}
              brands={brands}
            />
            {errors.brand && <span className="field-error">{errors.brand}</span>}

            {/* Perfume Name */}
            <div className="admin-field">
              <label htmlFor="product-name">
                Parfüm Adı <span className="required">*</span>
              </label>
              <input
                id="product-name"
                type="text"
                value={perfumeName}
                onChange={(e) => setPerfumeName(e.target.value)}
                placeholder="Baccarat Rouge 540"
              />
              {errors.perfumeName && <span className="field-error">{errors.perfumeName}</span>}
            </div>

            {/* Concentration */}
            <div className="admin-field">
              <label htmlFor="product-concentration">Konsantrasyon</label>
              <select
                id="product-concentration"
                value={concentration}
                onChange={(e) => setConcentration(e.target.value as Concentration)}
              >
                {CONCENTRATION_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Gender */}
            <div className="admin-field">
              <label>Cinsiyet</label>
              <div className="admin-radio-pills">
                {GENDER_OPTIONS.map((opt) => (
                  <div key={opt.value} className="admin-radio-pill">
                    <input
                      type="radio"
                      id={`gender-${opt.value}`}
                      name="gender"
                      value={opt.value}
                      checked={gender === opt.value}
                      onChange={() => setGender(opt.value)}
                    />
                    <label htmlFor={`gender-${opt.value}`}>{opt.label}</label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 2: Envanter & Fiyatlandırma ──────────────────────────── */}
      <section className="admin-form-section" aria-labelledby="section-2-title">
        <div className="admin-form-section-header">
          <span className="admin-form-section-number">2</span>
          <h2 id="section-2-title">Envanter & Fiyatlandırma</h2>
        </div>
        <div className="admin-form-section-body">
          <div className="admin-form-grid" style={{ marginBottom: 24, paddingBottom: 24, borderBottom: '1px solid #f0ebe0' }}>
            {/* Stock */}
            <div className="admin-field">
              <label htmlFor="product-stock">Stok Adedi</label>
              <input
                id="product-stock"
                type="number"
                min="0"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
              />
            </div>

            {/* Availability */}
            <div className="admin-field">
              <label htmlFor="product-availability">Stok Durumu</label>
              <select
                id="product-availability"
                value={availability}
                onChange={(e) => setAvailability(e.target.value as Availability)}
              >
                {AVAILABILITY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: '#1a1a1a' }}>Dekant Fiyatları</h3>
          <div className="admin-form-grid-3">
            {/* 3ml Card */}
            <div style={{ background: '#faf8f2', padding: 16, borderRadius: 8, border: '1px solid #f0ebe0' }}>
              <div style={{ fontWeight: 600, marginBottom: 12, color: '#D4AF37' }}>3ml Şişe</div>
              <div className="admin-field" style={{ marginBottom: 12 }}>
                <label htmlFor="price-3ml">Satış Fiyatı <span className="required">*</span></label>
                <div className="admin-price-input">
                  <span className="currency-symbol">₺</span>
                  <input
                    id="price-3ml"
                    type="number"
                    min="0"
                    step="0.01"
                    value={price3ml}
                    onChange={(e) => setPrice3ml(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                {errors.price3ml && <span className="field-error">{errors.price3ml}</span>}
              </div>
              <div className="admin-field">
                <label htmlFor="compare-3ml">Üstü Çizili Fiyat</label>
                <div className="admin-price-input">
                  <span className="currency-symbol">₺</span>
                  <input
                    id="compare-3ml"
                    type="number"
                    min="0"
                    step="0.01"
                    value={compare3ml}
                    onChange={(e) => setCompare3ml(e.target.value)}
                    placeholder="Opsiyonel"
                  />
                </div>
              </div>
            </div>

            {/* 5ml Card */}
            <div style={{ background: '#faf8f2', padding: 16, borderRadius: 8, border: '1px solid #f0ebe0' }}>
              <div style={{ fontWeight: 600, marginBottom: 12, color: '#D4AF37' }}>5ml Şişe</div>
              <div className="admin-field" style={{ marginBottom: 12 }}>
                <label htmlFor="price-5ml">Satış Fiyatı <span className="required">*</span></label>
                <div className="admin-price-input">
                  <span className="currency-symbol">₺</span>
                  <input
                    id="price-5ml"
                    type="number"
                    min="0"
                    step="0.01"
                    value={price5ml}
                    onChange={(e) => setPrice5ml(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                {errors.price5ml && <span className="field-error">{errors.price5ml}</span>}
              </div>
              <div className="admin-field">
                <label htmlFor="compare-5ml">Üstü Çizili Fiyat</label>
                <div className="admin-price-input">
                  <span className="currency-symbol">₺</span>
                  <input
                    id="compare-5ml"
                    type="number"
                    min="0"
                    step="0.01"
                    value={compare5ml}
                    onChange={(e) => setCompare5ml(e.target.value)}
                    placeholder="Opsiyonel"
                  />
                </div>
              </div>
            </div>

            {/* 10ml Card */}
            <div style={{ background: '#faf8f2', padding: 16, borderRadius: 8, border: '1px solid #f0ebe0' }}>
              <div style={{ fontWeight: 600, marginBottom: 12, color: '#D4AF37' }}>10ml Şişe</div>
              <div className="admin-field" style={{ marginBottom: 12 }}>
                <label htmlFor="price-10ml">Satış Fiyatı <span className="required">*</span></label>
                <div className="admin-price-input">
                  <span className="currency-symbol">₺</span>
                  <input
                    id="price-10ml"
                    type="number"
                    min="0"
                    step="0.01"
                    value={price10ml}
                    onChange={(e) => setPrice10ml(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                {errors.price10ml && <span className="field-error">{errors.price10ml}</span>}
              </div>
              <div className="admin-field">
                <label htmlFor="compare-10ml">Üstü Çizili Fiyat</label>
                <div className="admin-price-input">
                  <span className="currency-symbol">₺</span>
                  <input
                    id="compare-10ml"
                    type="number"
                    min="0"
                    step="0.01"
                    value={compare10ml}
                    onChange={(e) => setCompare10ml(e.target.value)}
                    placeholder="Opsiyonel"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 3: Koku Profili ──────────────────────────────────────── */}
      <section className="admin-form-section" aria-labelledby="section-3-title">
        <div className="admin-form-section-header">
          <span className="admin-form-section-number">3</span>
          <h2 id="section-3-title">Koku Profili</h2>
        </div>
        <div className="admin-form-section-body">
          <div className="admin-form-grid" style={{ marginBottom: 24 }}>
            {/* Scent Family */}
            <div className="admin-field">
              <label>Koku Ailesi</label>
              <div className="admin-chips">
                {SCENT_FAMILIES.map((fam) => (
                  <div key={fam} className="admin-chip">
                    <input
                      type="checkbox"
                      id={`scent-${fam}`}
                      checked={scentFamily.includes(fam)}
                      onChange={() => toggleChip(scentFamily, setScentFamily, fam)}
                    />
                    <label htmlFor={`scent-${fam}`}>{fam}</label>
                  </div>
                ))}
              </div>
            </div>

            {/* Season */}
            <div className="admin-field">
              <label>Mevsim</label>
              <div className="admin-chips">
                {SEASONS.map((s) => (
                  <div key={s} className="admin-chip">
                    <input
                      type="checkbox"
                      id={`season-${s}`}
                      checked={season.includes(s)}
                      onChange={() => toggleChip(season, setSeason, s)}
                    />
                    <label htmlFor={`season-${s}`}>{s}</label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="admin-form-grid-3" style={{ marginBottom: 24, paddingBottom: 24, borderBottom: '1px solid #f0ebe0' }}>
            {/* Time of Day */}
            <div className="admin-field">
              <label>Kullanım Zamanı</label>
              <div className="admin-chips">
                {TIMES.map((t) => (
                  <div key={t} className="admin-chip">
                    <input
                      type="checkbox"
                      id={`time-${t}`}
                      checked={timeOfDay.includes(t)}
                      onChange={() => toggleChip(timeOfDay, setTimeOfDay, t)}
                    />
                    <label htmlFor={`time-${t}`}>{t}</label>
                  </div>
                ))}
              </div>
            </div>

            {/* Longevity */}
            <div className="admin-field">
              <label>Kalıcılık</label>
              <div className="admin-radio-pills">
                {LONGEVITY_OPTIONS.map((opt) => (
                  <div key={opt} className="admin-radio-pill">
                    <input
                      type="radio"
                      id={`longevity-${opt}`}
                      name="longevity"
                      value={opt}
                      checked={longevity === opt}
                      onChange={() => setLongevity(opt)}
                    />
                    <label htmlFor={`longevity-${opt}`}>{opt}</label>
                  </div>
                ))}
              </div>
            </div>

            {/* Sillage */}
            <div className="admin-field">
              <label>Sillage (İz)</label>
              <div className="admin-radio-pills">
                {SILLAGE_OPTIONS.map((opt) => (
                  <div key={opt} className="admin-radio-pill">
                    <input
                      type="radio"
                      id={`sillage-${opt}`}
                      name="sillage"
                      value={opt}
                      checked={sillage === opt}
                      onChange={() => setSillage(opt)}
                    />
                    <label htmlFor={`sillage-${opt}`}>{opt}</label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="admin-form-grid-3">
            <TagInput
              label="Üst Notalar"
              tags={topNotes}
              onChange={setTopNotes}
              placeholder="Bergamot, Limon..."
            />
            <TagInput
              label="Kalp Notaları"
              tags={heartNotes}
              onChange={setHeartNotes}
              placeholder="Gül, Yasemin..."
            />
            <TagInput
              label="Alt Notalar"
              tags={baseNotes}
              onChange={setBaseNotes}
              placeholder="Vanilya, Misk..."
            />
          </div>
        </div>
      </section>

      {/* ─── SECTION 4: Görseller ─────────────────────────────────────────── */}
      <section className="admin-form-section" aria-labelledby="section-4-title">
        <div className="admin-form-section-header">
          <span className="admin-form-section-number">4</span>
          <h2 id="section-4-title">Görseller</h2>
        </div>
        <div className="admin-form-section-body">
          <p className="field-hint" style={{ marginBottom: 16 }}>
            İlk görsel ana görsel olarak kullanılır. Sırayı değiştirmek için sürükleyip bırakın.
          </p>

          <div className="admin-image-grid">
            {images.map((img, index) => (
              <div
                key={img.publicId || index}
                className={`admin-image-item ${index === 0 ? "main" : ""} ${dragIndex === index ? "dragging" : ""} ${dragOverIndex === index ? "drag-over" : ""}`}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={() => handleDrop(index)}
                onDragEnd={handleDragEnd}
              >
                <img src={img.url} alt={img.alt || `Ürün görseli ${index + 1}`} />
                {index === 0 && (
                  <span className="admin-image-main-badge">ANA</span>
                )}
                <button
                  type="button"
                  className="admin-image-remove"
                  onClick={() => handleImageRemove(index)}
                  aria-label={`Görsel ${index + 1} sil`}
                >
                  ×
                </button>
              </div>
            ))}

            {/* Upload Button */}
            <label className="admin-image-upload-btn" aria-label="Görsel yükle">
              {uploading ? (
                <span className="admin-spinner" />
              ) : (
                <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                  Görsel Ekle
                </>
              )}
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                style={{ display: "none" }}
                disabled={uploading}
              />
            </label>
          </div>
        </div>
      </section>

      {/* ─── SECTION 5: Yayın ─────────────────────────────────────────────── */}
      <section className="admin-form-section" aria-labelledby="section-5-title">
        <div className="admin-form-section-header">
          <span className="admin-form-section-number">5</span>
          <h2 id="section-5-title">Yayın</h2>
        </div>
        <div className="admin-form-section-body">
          <div className="admin-form-grid" style={{ marginBottom: 20 }}>
            {/* Published Toggle */}
            <div className="admin-field" style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <label className="admin-toggle">
                <input
                  type="checkbox"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  aria-label="Yayında"
                />
                <span className="admin-toggle-slider" />
              </label>
              <span style={{ fontSize: 14, fontWeight: 500, color: isPublished ? "#16a34a" : "#888" }}>
                {isPublished ? "Yayında" : "Taslak"}
              </span>
            </div>

            {/* Featured Toggle */}
            <div className="admin-field" style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <label className="admin-toggle">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  aria-label="Öne Çıkan"
                />
                <span className="admin-toggle-slider" />
              </label>
              <span style={{ fontSize: 14, fontWeight: 500, color: isFeatured ? "#D4AF37" : "#888" }}>
                Öne Çıkan
              </span>
            </div>

            {/* isNew Toggle */}
            <div className="admin-field" style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <label className="admin-toggle">
                <input
                  type="checkbox"
                  checked={isNew}
                  onChange={(e) => setIsNew(e.target.checked)}
                  aria-label="Yeni Ürün"
                />
                <span className="admin-toggle-slider" />
              </label>
              <span style={{ fontSize: 14, fontWeight: 500, color: isNew ? "#3b82f6" : "#888" }}>
                Yeni Ürün {isNew && <span style={{ fontSize: 11, color: "#aaa" }}>(30 gün)</span>}
              </span>
            </div>
          </div>

          {/* Tags */}
          <div style={{ marginBottom: 20 }}>
            <TagInput
              label="Etiketler"
              tags={tags}
              onChange={setTags}
              placeholder="niche, bestseller, indirim..."
            />
          </div>

          {/* Admin Note */}
          <div className="admin-field">
            <label htmlFor="admin-note">Dahili Not</label>
            <textarea
              id="admin-note"
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              placeholder="Sadece admin tarafından görülen notlar..."
              rows={3}
            />
          </div>
        </div>
      </section>

      {/* ─── Bottom Action Bar ────────────────────────────────────────────── */}
      <div className="admin-form-actions">
        <div>
          {isEditing && (
            <button
              type="button"
              className="admin-btn-danger"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={saving}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14 }}>
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
              </svg>
              Ürünü Sil
            </button>
          )}
        </div>
        <div className="admin-form-actions-right">
          <button
            type="button"
            className="admin-btn-secondary"
            onClick={() => router.push("/admin/products")}
            disabled={saving}
          >
            İptal
          </button>
          <button
            type="button"
            className="admin-btn-primary"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
              <span className="admin-spinner" style={{ width: 16, height: 16, borderColor: "rgba(0,0,0,0.2)", borderTopColor: "#0a0a0a" }} />
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16 }}>
                  <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
                  <polyline points="17 21 17 13 7 13 7 21" />
                  <polyline points="7 3 7 8 15 8" />
                </svg>
                {isEditing ? "Güncelle" : "Kaydet"}
              </>
            )}
          </button>
        </div>
      </div>

      {/* ─── Toast ─────────────────────────────────────────────────────────── */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* ─── Delete Confirm Dialog ─────────────────────────────────────────── */}
      {showDeleteConfirm && (
        <ConfirmDialog
          title="Ürünü Sil"
          message={`"${perfumeName || "Bu ürün"}" kalıcı olarak silinecek. Bu işlem geri alınamaz.`}
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
    </div>
  );
}
