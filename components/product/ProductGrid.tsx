"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import ProductCard from "./ProductCard";
import type { Product } from "@/types";
import { FiX, FiMenu, FiChevronDown, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { TbLayoutList, TbColumns2, TbColumns3, TbLayoutGrid } from "react-icons/tb";
import ProductFilters, { type FilterState } from "./ProductFilters";

interface ProductGridProps {
  initialProducts: Product[];
}

const ITEMS_PER_PAGE = 12;

const DEFAULT_FILTERS: FilterState = {
  gender: "",
  brands: [],
  scents: [],
  sizes: [],
  seasons: [],
  minPrice: 0,
  maxPrice: 5000,
};

const sortOptions = [
  { value: "newest", label: "En Yeni" },
  { value: "cheapest", label: "En Ucuz" },
  { value: "expensive", label: "En Pahalı" },
  { value: "bestseller", label: "Çok Satanlar" },
];

export default function ProductGrid({ initialProducts }: ProductGridProps) {

  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [sort, setSort] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [desktopCols, setDesktopCols] = useState<3 | 4>(3);
  const [mobileCols, setMobileCols] = useState<1 | 2>(2);
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);

  const sortDropdownRef = useRef<HTMLDivElement>(null);

  // Close sort dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) {
        setIsSortDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ─── All filtering, sorting, pagination done in memory ──────────────────────
  const processedProducts = useMemo(() => {
    // 1. Filter
    let result = initialProducts.filter((product) => {
      if (filters.gender && product.gender !== filters.gender) return false;
      if (filters.brands.length > 0 && !filters.brands.includes(product.brand)) return false;
      if (filters.scents.length > 0 && !product.scentFamily?.some((s) => filters.scents.includes(s))) return false;
      if (filters.sizes.length > 0 && !filters.sizes.some((sz) => product.prices?.[sz as "3ml" | "5ml" | "10ml"] !== undefined)) return false;
      if (filters.seasons.length > 0 && !product.season?.some((sn) => filters.seasons.includes(sn))) return false;

      const lowestPrice = Math.min(
        ...Object.values(product.prices || {}).map(Number).filter((p) => !isNaN(p))
      );
      if (lowestPrice < filters.minPrice || lowestPrice > filters.maxPrice) return false;

      return true;
    });

    // 2. Sort
    result = [...result].sort((a, b) => {
      const getLowestPrice = (p: Product) =>
        Math.min(...Object.values(p.prices || {}).map(Number).filter((n) => !isNaN(n)));

      switch (sort) {
        case "cheapest":  return getLowestPrice(a) - getLowestPrice(b);
        case "expensive": return getLowestPrice(b) - getLowestPrice(a);
        case "bestseller": return (b.soldCount ?? 0) - (a.soldCount ?? 0);
        case "newest":
        default:
          return (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0);
      }
    });

    return result;
  }, [initialProducts, filters, sort]);

  const totalCount  = processedProducts.length;
  const totalPages  = Math.ceil(totalCount / ITEMS_PER_PAGE);
  const safePage    = Math.min(currentPage, Math.max(1, totalPages));
  const startIndex  = (safePage - 1) * ITEMS_PER_PAGE;
  const pageProducts = processedProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Reset to page 1 whenever filters or sort change
  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleSortChange = (newSort: string) => {
    setSort(newSort);
    setCurrentPage(1);
    setIsSortDropdownOpen(false);
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ─── Filter chip helpers ─────────────────────────────────────────────────────
  const hasActiveFilters =
    filters.gender ||
    filters.brands.length > 0 ||
    filters.scents.length > 0 ||
    filters.sizes.length > 0 ||
    filters.seasons.length > 0 ||
    filters.minPrice > 0 ||
    filters.maxPrice < 5000;

  const removeChip = (key: keyof FilterState, value?: string) => {
    if (key === "gender") {
      handleFiltersChange({ ...filters, gender: "" });
    } else if (key === "minPrice" || key === "maxPrice") {
      handleFiltersChange({ ...filters, minPrice: 0, maxPrice: 5000 });
    } else {
      const list = filters[key] as string[];
      handleFiltersChange({ ...filters, [key]: value ? list.filter((v) => v !== value) : [] });
    }
  };

  const clearAllFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setCurrentPage(1);
  };

  // ─── Pagination range ────────────────────────────────────────────────────────
  const getPaginationRange = () => {
    let start = Math.max(1, safePage - 2);
    const end = Math.min(totalPages, start + 4);
    if (end - start < 4) start = Math.max(1, end - 4);
    return Array.from({ length: Math.max(0, end - start + 1) }, (_, i) => start + i);
  };

  const selectedSortOption = sortOptions.find((o) => o.value === sort) || sortOptions[0];

  // ─── Gender display helper ───────────────────────────────────────────────────
  const genderLabel = (g: string) =>
    g === "male" ? "Erkek" : g === "female" ? "Kadın" : g === "unisex" ? "Unisex" : g;

  return (
    <div className="flex flex-col md:flex-row gap-8 items-start w-full">

      {/* Desktop Sidebar Filters */}
      <aside className="hidden md:block w-[280px] shrink-0 sticky top-24">
        <ProductFilters filters={filters} onChange={handleFiltersChange} />
      </aside>

      {/* Main Content */}
      <div className="flex-grow space-y-6 w-full min-w-0">
      
      {/* Controls Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#C9A84C]/15 pb-3 sm:pb-4 space-y-3 md:space-y-0 sticky top-16 sm:top-20 md:static bg-cream-light md:bg-transparent z-40 pt-2 md:pt-0 px-1 sm:px-0">
        
        {/* Left Side */}
        <div className="flex items-center justify-between sm:justify-start space-x-4 rtl:space-x-reverse">
          <button
            onClick={() => setIsMobileDrawerOpen(true)}
            className="md:hidden flex items-center space-x-2 rtl:space-x-reverse py-2 px-3 text-[11px] font-montserrat tracking-[0.2em] uppercase font-semibold text-charcoal border border-[#C9A84C]/40 hover:border-[#C9A84C] transition-colors"
          >
            <FiMenu size={16} />
            <span>Filtreler</span>
            {hasActiveFilters && (
              <span className="bg-[#8B6914] text-cream-light text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                !
              </span>
            )}
          </button>
          
          <span className="font-montserrat text-[11px] text-charcoal/60 tracking-widests uppercase hidden sm:block">
            <strong className="text-charcoal font-bold">{totalCount}</strong> Ürün Listeleniyor
          </span>
        </div>

        {/* Right Side: Sort + Layout */}
        <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
          
          {/* Sort Dropdown */}
          <div className="relative flex items-center space-x-3 rtl:space-x-reverse pb-1" ref={sortDropdownRef}>
            <span className="font-montserrat text-[10px] uppercase tracking-widests text-charcoal/50 font-semibold">
              Sırala:
            </span>
            <div className="relative">
              <button
                onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                className="flex items-center space-x-2 rtl:space-x-reverse text-[11px] font-montserrat font-bold text-charcoal hover:text-[#C9A84C] transition-colors duration-200 uppercase tracking-wider bg-transparent"
              >
                <span>{selectedSortOption.label}</span>
                <FiChevronDown className={`transition-transform duration-300 ${isSortDropdownOpen ? "rotate-180" : ""}`} />
              </button>
              
              {isSortDropdownOpen && (
                <div className="absolute top-full left-0 rtl:right-0 rtl:left-auto md:right-0 md:left-auto rtl:md:left-0 rtl:md:right-auto mt-2 w-48 bg-white border border-[#C9A84C]/20 shadow-[0_10px_40px_rgba(0,0,0,0.08)] py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  {sortOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleSortChange(option.value)}
                      className={`block w-full text-left px-4 py-2.5 text-[11px] font-montserrat uppercase tracking-widests transition-colors ${
                        sort === option.value
                          ? "bg-[#C9A84C]/10 text-[#C9A84C] font-bold"
                          : "text-charcoal/70 hover:bg-cream hover:text-charcoal font-medium"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Desktop Grid Layout Switcher */}
          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={() => setDesktopCols(3)}
              className={`text-[10px] font-montserrat font-bold tracking-widests uppercase transition-all duration-200 pb-1 border-b-2 flex items-center justify-center ${desktopCols === 3 ? "text-[#C9A84C] border-[#C9A84C]" : "text-charcoal/40 border-transparent hover:text-charcoal"}`}
              title="3'lü Görünüm"
            >
              <TbColumns3 size={20} strokeWidth={1.5} />
            </button>
            <button
              onClick={() => setDesktopCols(4)}
              className={`text-[10px] font-montserrat font-bold tracking-widests uppercase transition-all duration-200 pb-1 border-b-2 flex items-center justify-center ${desktopCols === 4 ? "text-[#C9A84C] border-[#C9A84C]" : "text-charcoal/40 border-transparent hover:text-charcoal"}`}
              title="4'lü Görünüm"
            >
              <TbLayoutGrid size={20} strokeWidth={1.5} />
            </button>
          </div>

          {/* Mobile Grid Layout Switcher */}
          <div className="flex md:hidden items-center space-x-4">
            <button
              onClick={() => setMobileCols(1)}
              className={`text-[10px] font-montserrat font-bold tracking-widests uppercase transition-all duration-200 pb-1 border-b-2 flex items-center justify-center ${mobileCols === 1 ? "text-[#C9A84C] border-[#C9A84C]" : "text-charcoal/40 border-transparent hover:text-charcoal"}`}
              title="1'li Görünüm"
            >
              <TbLayoutList size={20} strokeWidth={1.5} />
            </button>
            <button
              onClick={() => setMobileCols(2)}
              className={`text-[10px] font-montserrat font-bold tracking-widests uppercase transition-all duration-200 pb-1 border-b-2 flex items-center justify-center ${mobileCols === 2 ? "text-[#C9A84C] border-[#C9A84C]" : "text-charcoal/40 border-transparent hover:text-charcoal"}`}
              title="2'li Görünüm"
            >
              <TbColumns2 size={20} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </div>

      {/* Active Filter Chips */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2.5 items-center pb-4">
          <span className="font-montserrat text-[10px] uppercase tracking-widests text-charcoal/50 mr-2 rtl:ml-2 font-semibold">
            Aktif Filtreler:
          </span>

          {filters.gender && (
            <span className="inline-flex items-center space-x-1.5 rtl:space-x-reverse bg-transparent text-charcoal text-[10px] uppercase tracking-wider font-montserrat py-1 px-3 border border-charcoal/20 rounded-full hover:border-[#C9A84C] transition-all">
              <span className="font-semibold">{genderLabel(filters.gender)}</span>
              <button onClick={() => removeChip("gender")} className="text-charcoal/40 hover:text-[#C9A84C] ml-1 transition-colors"><FiX size={12} /></button>
            </span>
          )}

          {(filters.minPrice > 0 || filters.maxPrice < 5000) && (
            <span className="inline-flex items-center space-x-1.5 rtl:space-x-reverse bg-transparent text-charcoal text-[10px] uppercase tracking-wider font-montserrat py-1 px-3 border border-charcoal/20 rounded-full hover:border-[#C9A84C] transition-all">
              <span className="font-semibold">₺{filters.minPrice} - ₺{filters.maxPrice}</span>
              <button onClick={() => removeChip("minPrice")} className="text-charcoal/40 hover:text-[#C9A84C] ml-1 transition-colors"><FiX size={12} /></button>
            </span>
          )}

          {filters.brands.map((b) => (
            <span key={b} className="inline-flex items-center space-x-1.5 rtl:space-x-reverse bg-transparent text-charcoal text-[10px] uppercase tracking-wider font-montserrat py-1 px-3 border border-charcoal/20 rounded-full hover:border-[#C9A84C] transition-all">
              <span className="font-semibold">{b}</span>
              <button onClick={() => removeChip("brands", b)} className="text-charcoal/40 hover:text-[#C9A84C] ml-1 transition-colors"><FiX size={12} /></button>
            </span>
          ))}

          {filters.scents.map((s) => (
            <span key={s} className="inline-flex items-center space-x-1.5 rtl:space-x-reverse bg-transparent text-charcoal text-[10px] uppercase tracking-wider font-montserrat py-1 px-3 border border-charcoal/20 rounded-full hover:border-[#C9A84C] transition-all">
              <span className="font-semibold">{s}</span>
              <button onClick={() => removeChip("scents", s)} className="text-charcoal/40 hover:text-[#C9A84C] ml-1 transition-colors"><FiX size={12} /></button>
            </span>
          ))}

          {filters.sizes.map((sz) => (
            <span key={sz} className="inline-flex items-center space-x-1.5 rtl:space-x-reverse bg-transparent text-charcoal text-[10px] uppercase tracking-wider font-montserrat py-1 px-3 border border-charcoal/20 rounded-full hover:border-[#C9A84C] transition-all">
              <span className="font-semibold">{sz}</span>
              <button onClick={() => removeChip("sizes", sz)} className="text-charcoal/40 hover:text-[#C9A84C] ml-1 transition-colors"><FiX size={12} /></button>
            </span>
          ))}

          {filters.seasons.map((sn) => (
            <span key={sn} className="inline-flex items-center space-x-1.5 rtl:space-x-reverse bg-transparent text-charcoal text-[10px] uppercase tracking-wider font-montserrat py-1 px-3 border border-charcoal/20 rounded-full hover:border-[#C9A84C] transition-all">
              <span className="font-semibold">{sn}</span>
              <button onClick={() => removeChip("seasons", sn)} className="text-charcoal/40 hover:text-[#C9A84C] ml-1 transition-colors"><FiX size={12} /></button>
            </span>
          ))}

          <button
            onClick={clearAllFilters}
            className="text-[10px] font-montserrat font-bold tracking-widests text-[#8B6914] hover:text-[#C9A84C] uppercase ml-auto underline underline-offset-4 transition-colors"
          >
            Temizle
          </button>
        </div>
      )}

      {/* Main Grid */}
      {pageProducts.length === 0 ? (
        <div className="bg-white border border-[#C9A84C]/15 py-20 text-center shadow-sm">
          <p className="font-playfair text-lg text-charcoal font-semibold mb-2">
            Aramanıza Uygun Parfüm Bulunamadı
          </p>
          <p className="font-montserrat text-xs text-charcoal/60">
            Lütfen filtre ayarlarını değiştirerek tekrar deneyiniz.
          </p>
        </div>
      ) : (
        <div className={`grid gap-3 sm:gap-6 transition-all duration-500 ease-in-out ${
          mobileCols === 1 ? "grid-cols-1" : "grid-cols-2"
        } ${
          desktopCols === 3 ? "md:grid-cols-3" : "md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4"
        }`}>
          {pageProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1.5 sm:gap-2 pt-8 sm:pt-12 pb-6 sm:pb-8 flex-wrap">
          <button
            onClick={() => handlePageChange(safePage - 1)}
            disabled={safePage === 1}
            className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 border border-[#C9A84C]/30 text-charcoal hover:bg-[#C9A84C] hover:text-white hover:border-[#C9A84C] disabled:opacity-30 disabled:pointer-events-none transition-all duration-300 rounded-none shadow-sm"
            title="Önceki"
          >
            <FiChevronLeft size={18} />
          </button>
          
          {getPaginationRange().map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 font-montserrat text-xs sm:text-sm font-semibold transition-all duration-300 shadow-sm ${
                safePage === page
                  ? "bg-[#C9A84C] text-white border border-[#C9A84C]"
                  : "bg-white border border-[#C9A84C]/30 text-charcoal hover:bg-[#C9A84C]/10 hover:border-[#C9A84C]"
              }`}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() => handlePageChange(safePage + 1)}
            disabled={safePage === totalPages}
            className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 border border-[#C9A84C]/30 text-charcoal hover:bg-[#C9A84C] hover:text-white hover:border-[#C9A84C] disabled:opacity-30 disabled:pointer-events-none transition-all duration-300 rounded-none shadow-sm"
            title="Sonraki"
          >
            <FiChevronRight size={18} />
          </button>
        </div>
      )}

      {/* Mobile Filters Drawer */}
      <div
        className={`fixed inset-0 z-[45] transition-opacity duration-300 md:hidden ${
          isMobileDrawerOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <div onClick={() => setIsMobileDrawerOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
        
        <div
          className={`absolute bottom-0 left-0 w-full h-[85vh] bg-white rounded-t-3xl border-t border-[#C9A84C]/25 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] flex flex-col shadow-[0_-10px_40px_rgba(0,0,0,0.15)] ${
            isMobileDrawerOpen ? "translate-y-0" : "translate-y-full"
          }`}
        >
          <div className="w-full flex justify-center pt-3 pb-1 cursor-grab active:cursor-grabbing" onClick={() => setIsMobileDrawerOpen(false)}>
            <div className="w-12 h-1.5 bg-charcoal/20 rounded-full" />
          </div>

          <div className="flex justify-between items-center px-6 py-4 border-b border-[#C9A84C]/10">
            <h3 className="font-playfair text-lg font-bold uppercase tracking-widests text-charcoal">FİLTRELER</h3>
            <button onClick={() => setIsMobileDrawerOpen(false)} className="text-charcoal p-2 hover:bg-cream-light rounded-full transition-colors focus:outline-none">
              <FiX size={22} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 pb-28">
            <ProductFilters filters={filters} onChange={handleFiltersChange} />
          </div>

          <div className="absolute bottom-0 left-0 w-full p-4 bg-white border-t border-[#C9A84C]/10 shadow-[0_-10px_20px_rgba(0,0,0,0.05)]" style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}>
            <button
              onClick={() => setIsMobileDrawerOpen(false)}
              className="w-full bg-charcoal text-white font-montserrat text-xs tracking-widests uppercase font-bold py-4 hover:bg-[#C9A84C] transition-colors shadow-md rounded-sm"
            >
              Sonuçları Göster ({totalCount})
            </button>
          </div>
        </div>
      </div>

      </div>

    </div>
  );
}
