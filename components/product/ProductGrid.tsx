"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import ProductCard from "./ProductCard";
import type { Product } from "@/types";
import { FiX, FiMenu, FiChevronDown, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { TbLayoutList, TbColumns2, TbColumns3, TbLayoutGrid } from "react-icons/tb";
import ProductFilters from "./ProductFilters";

interface ProductGridProps {
  products: Product[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
}

const sortOptions = [
  { value: "newest", label: "En Yeni" },
  { value: "cheapest", label: "En Ucuz" },
  { value: "expensive", label: "En Pahalı" },
  { value: "bestseller", label: "Çok Satanlar" },
];

export default function ProductGrid({
  products,
  totalCount,
  currentPage,
  totalPages,
}: ProductGridProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [desktopCols, setDesktopCols] = useState<3 | 4>(3);
  const [mobileCols, setMobileCols] = useState<1 | 2>(2);
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);

  const sortDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) {
        setIsSortDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Active filters retrieval
  const gender = searchParams.get("gender") || "";
  const brands = searchParams.getAll("brand");
  const scents = searchParams.getAll("scent");
  const sizes = searchParams.getAll("size");
  const seasons = searchParams.getAll("season");
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";
  const sortBy = searchParams.get("sort") || "newest";

  const selectedSortOption = sortOptions.find(o => o.value === sortBy) || sortOptions[0];

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`${pathname}?${params.toString()}`);
    // Scroll to top smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSortChange = (sort: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", sort);
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
    setIsSortDropdownOpen(false);
  };

  const removeFilterParam = (key: string, value?: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      const remainingValues = params.getAll(key).filter((v) => v !== value);
      params.delete(key);
      remainingValues.forEach((v) => params.append(key, v));
    } else {
      params.delete(key);
    }
    
    // Reset page on filter clear
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  };

  const clearAllFilters = () => {
    router.push(pathname);
  };

  // Check if any filter is active
  const hasActiveFilters =
    gender ||
    brands.length > 0 ||
    scents.length > 0 ||
    sizes.length > 0 ||
    seasons.length > 0 ||
    (minPrice && minPrice !== "0") ||
    (maxPrice && maxPrice !== "5000");

  const getPaginationRange = () => {
    let start = Math.max(1, currentPage - 2);
    const end = Math.min(totalPages, start + 4);
    if (end - start < 4) {
      start = Math.max(1, end - 4);
    }
    return Array.from({ length: Math.max(0, end - start + 1) }, (_, i) => start + i);
  };

  return (
    <div className="flex-grow space-y-6 w-full">
      
      {/* Controls Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#C9A84C]/15 pb-4 space-y-4 md:space-y-0 sticky top-16 md:static bg-cream-light md:bg-transparent z-40 pt-2 md:pt-0">
        
        {/* Left Side: Mobile Filter Toggle & Desktop Items Count */}
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
          
          <span className="font-montserrat text-[11px] text-charcoal/60 tracking-widest uppercase hidden sm:block">
            <strong className="text-charcoal font-bold">{totalCount}</strong> Ürün Listeleniyor
          </span>
        </div>

        {/* Right side layout controls & sort */}
        <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
          
          {/* Custom Sort Selector */}
          <div className="relative flex items-center space-x-3 rtl:space-x-reverse pb-1" ref={sortDropdownRef}>
            <span className="font-montserrat text-[10px] uppercase tracking-widest text-charcoal/50 font-semibold">
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
              
              {/* Dropdown Menu */}
              {isSortDropdownOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-[#C9A84C]/20 shadow-[0_10px_40px_rgba(0,0,0,0.08)] py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  {sortOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleSortChange(option.value)}
                      className={`block w-full text-left px-4 py-2.5 text-[11px] font-montserrat uppercase tracking-widest transition-colors ${
                        sortBy === option.value
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

          {/* Desktop Grid Layout Switcher (Hidden on mobile) */}
          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={() => setDesktopCols(3)}
              className={`text-[10px] font-montserrat font-bold tracking-widest uppercase transition-all duration-200 pb-1 border-b-2 flex items-center justify-center ${
                desktopCols === 3
                  ? "text-[#C9A84C] border-[#C9A84C]"
                  : "text-charcoal/40 border-transparent hover:text-charcoal"
              }`}
              title="3'lü Görünüm"
            >
              <TbColumns3 size={20} strokeWidth={1.5} />
            </button>
            <button
              onClick={() => setDesktopCols(4)}
              className={`text-[10px] font-montserrat font-bold tracking-widest uppercase transition-all duration-200 pb-1 border-b-2 flex items-center justify-center ${
                desktopCols === 4
                  ? "text-[#C9A84C] border-[#C9A84C]"
                  : "text-charcoal/40 border-transparent hover:text-charcoal"
              }`}
              title="4'lü Görünüm"
            >
              <TbLayoutGrid size={20} strokeWidth={1.5} />
            </button>
          </div>

          {/* Mobile Grid Layout Switcher (Hidden on desktop) */}
          <div className="flex md:hidden items-center space-x-4">
            <button
              onClick={() => setMobileCols(1)}
              className={`text-[10px] font-montserrat font-bold tracking-widest uppercase transition-all duration-200 pb-1 border-b-2 flex items-center justify-center ${
                mobileCols === 1
                  ? "text-[#C9A84C] border-[#C9A84C]"
                  : "text-charcoal/40 border-transparent hover:text-charcoal"
              }`}
              title="1'li Görünüm"
            >
              <TbLayoutList size={20} strokeWidth={1.5} />
            </button>
            <button
              onClick={() => setMobileCols(2)}
              className={`text-[10px] font-montserrat font-bold tracking-widest uppercase transition-all duration-200 pb-1 border-b-2 flex items-center justify-center ${
                mobileCols === 2
                  ? "text-[#C9A84C] border-[#C9A84C]"
                  : "text-charcoal/40 border-transparent hover:text-charcoal"
              }`}
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
          <span className="font-montserrat text-[10px] uppercase tracking-widest text-charcoal/50 mr-2 rtl:ml-2 font-semibold">
            Aktif Filtreler:
          </span>
          
          {gender && (
            <span className="inline-flex items-center space-x-1.5 rtl:space-x-reverse bg-transparent text-charcoal text-[10px] uppercase tracking-wider font-montserrat py-1 px-3 border border-charcoal/20 rounded-full hover:border-[#C9A84C] transition-all">
              <span className="font-semibold">
                {gender === "male" ? "Erkek" : gender === "female" ? "Kadın" : "Unisex"}
              </span>
              <button onClick={() => removeFilterParam("gender")} className="text-charcoal/40 hover:text-[#C9A84C] ml-1 transition-colors">
                <FiX size={12} />
              </button>
            </span>
          )}

          {((minPrice && minPrice !== "0") || (maxPrice && maxPrice !== "5000")) && (
            <span className="inline-flex items-center space-x-1.5 rtl:space-x-reverse bg-transparent text-charcoal text-[10px] uppercase tracking-wider font-montserrat py-1 px-3 border border-charcoal/20 rounded-full hover:border-[#C9A84C] transition-all">
              <span className="font-semibold">
                ₺{minPrice || "0"} - ₺{maxPrice || "5000"}
              </span>
              <button
                onClick={() => {
                  removeFilterParam("minPrice");
                  removeFilterParam("maxPrice");
                }}
                className="text-charcoal/40 hover:text-[#C9A84C] ml-1 transition-colors"
              >
                <FiX size={12} />
              </button>
            </span>
          )}

          {brands.map((b) => (
            <span key={b} className="inline-flex items-center space-x-1.5 rtl:space-x-reverse bg-transparent text-charcoal text-[10px] uppercase tracking-wider font-montserrat py-1 px-3 border border-charcoal/20 rounded-full hover:border-[#C9A84C] transition-all">
              <span className="font-semibold">{b}</span>
              <button onClick={() => removeFilterParam("brand", b)} className="text-charcoal/40 hover:text-[#C9A84C] ml-1 transition-colors">
                <FiX size={12} />
              </button>
            </span>
          ))}

          {scents.map((s) => (
            <span key={s} className="inline-flex items-center space-x-1.5 rtl:space-x-reverse bg-transparent text-charcoal text-[10px] uppercase tracking-wider font-montserrat py-1 px-3 border border-charcoal/20 rounded-full hover:border-[#C9A84C] transition-all">
              <span className="font-semibold">{s}</span>
              <button onClick={() => removeFilterParam("scent", s)} className="text-charcoal/40 hover:text-[#C9A84C] ml-1 transition-colors">
                <FiX size={12} />
              </button>
            </span>
          ))}

          {sizes.map((sz) => (
            <span key={sz} className="inline-flex items-center space-x-1.5 rtl:space-x-reverse bg-transparent text-charcoal text-[10px] uppercase tracking-wider font-montserrat py-1 px-3 border border-charcoal/20 rounded-full hover:border-[#C9A84C] transition-all">
              <span className="font-semibold">{sz}</span>
              <button onClick={() => removeFilterParam("size", sz)} className="text-charcoal/40 hover:text-[#C9A84C] ml-1 transition-colors">
                <FiX size={12} />
              </button>
            </span>
          ))}

          {seasons.map((sn) => (
            <span key={sn} className="inline-flex items-center space-x-1.5 rtl:space-x-reverse bg-transparent text-charcoal text-[10px] uppercase tracking-wider font-montserrat py-1 px-3 border border-charcoal/20 rounded-full hover:border-[#C9A84C] transition-all">
              <span className="font-semibold">{sn}</span>
              <button onClick={() => removeFilterParam("season", sn)} className="text-charcoal/40 hover:text-[#C9A84C] ml-1 transition-colors">
                <FiX size={12} />
              </button>
            </span>
          ))}

          <button
            onClick={clearAllFilters}
            className="text-[10px] font-montserrat font-bold tracking-widest text-[#8B6914] hover:text-[#C9A84C] uppercase ml-auto underline underline-offset-4 transition-colors"
          >
            Temizle
          </button>
        </div>
      )}

      {/* Main Grid */}
      {products.length === 0 ? (
        <div className="bg-white border border-[#C9A84C]/15 py-20 text-center shadow-sm">
          <p className="font-playfair text-lg text-charcoal font-semibold mb-2">
            Aramanıza Uygun Parfüm Bulunamadı
          </p>
          <p className="font-montserrat text-xs text-charcoal/60">
            Lütfen filtre ayarlarını değiştirerek tekrar deneyiniz.
          </p>
        </div>
      ) : (
        <div className={`grid gap-6 transition-all duration-500 ease-in-out ${
          mobileCols === 1 ? "grid-cols-1" : "grid-cols-2"
        } ${
          desktopCols === 3 ? "md:grid-cols-3" : "md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4"
        }`}>
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {/* Square Numbered Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2 rtl:space-x-reverse pt-12 pb-8">
          {/* Previous Button */}
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="flex items-center justify-center w-10 h-10 border border-[#C9A84C]/30 text-charcoal hover:bg-[#C9A84C] hover:text-white hover:border-[#C9A84C] disabled:opacity-30 disabled:pointer-events-none transition-all duration-300 rounded-none shadow-sm mr-2"
            title="Önceki"
          >
            <FiChevronLeft size={18} />
          </button>
          
          {/* Page Numbers */}
          {getPaginationRange().map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`flex items-center justify-center w-10 h-10 font-montserrat text-sm font-semibold transition-all duration-300 shadow-sm ${
                currentPage === page
                  ? "bg-[#C9A84C] text-white border border-[#C9A84C]"
                  : "bg-white border border-[#C9A84C]/30 text-charcoal hover:bg-[#C9A84C]/10 hover:border-[#C9A84C]"
              }`}
            >
              {page}
            </button>
          ))}

          {/* Next Button */}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="flex items-center justify-center w-10 h-10 border border-[#C9A84C]/30 text-charcoal hover:bg-[#C9A84C] hover:text-white hover:border-[#C9A84C] disabled:opacity-30 disabled:pointer-events-none transition-all duration-300 rounded-none shadow-sm ml-2"
            title="Sonraki"
          >
            <FiChevronRight size={18} />
          </button>
        </div>
      )}

      {/* Mobile Drawer (Filters Bottom Sheet) */}
      <div
        className={`fixed inset-0 z-[110] transition-opacity duration-300 md:hidden ${
          isMobileDrawerOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Backdrop */}
        <div onClick={() => setIsMobileDrawerOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
        
        {/* Drawer content */}
        <div
          className={`absolute bottom-0 left-0 w-full h-[85vh] bg-white rounded-t-3xl border-t border-[#C9A84C]/25 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] flex flex-col shadow-[0_-10px_40px_rgba(0,0,0,0.15)] ${
            isMobileDrawerOpen ? "translate-y-0" : "translate-y-full"
          }`}
        >
          {/* Handle */}
          <div className="w-full flex justify-center pt-3 pb-1 cursor-grab active:cursor-grabbing" onClick={() => setIsMobileDrawerOpen(false)}>
            <div className="w-12 h-1.5 bg-charcoal/20 rounded-full" />
          </div>

          <div className="flex justify-between items-center px-6 py-4 border-b border-[#C9A84C]/10">
            <h3 className="font-playfair text-lg font-bold uppercase tracking-widest text-charcoal">FİLTRELER</h3>
            <button onClick={() => setIsMobileDrawerOpen(false)} className="text-charcoal p-2 hover:bg-cream-light rounded-full transition-colors focus:outline-none">
              <FiX size={22} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 pb-28">
            <ProductFilters />
          </div>

          {/* Sticky Bottom Apply Button */}
          <div className="absolute bottom-0 left-0 w-full p-4 bg-white border-t border-[#C9A84C]/10 shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
            <button
              onClick={() => setIsMobileDrawerOpen(false)}
              className="w-full bg-charcoal text-white font-montserrat text-xs tracking-widest uppercase font-bold py-4 hover:bg-[#C9A84C] transition-colors shadow-md rounded-sm"
            >
              Sonuçları Göster
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}

