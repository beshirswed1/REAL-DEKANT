"use client";

import React, { useState } from "react";
import { FiChevronDown, FiChevronUp, FiSliders, FiSearch, FiCheck, FiX } from "react-icons/fi";

const BRANDS = [
  "Chanel", "Dior", "Tom Ford", "Creed", "Kilian", "Byredo", 
  "Parfums de Marly", "Xerjoff", "Amouage", "Le Labo", 
  "Maison Francis Kurkdjian", "Diptyque", "Jo Malone", "Penhaligon's", 
  "Memo Paris", "Nishane", "Initio", "Roja Parfums", "Frederic Malle", 
  "Armani Privé", "Tom Ford Private Blend", "Yves Saint Laurent", 
  "Givenchy", "Prada", "Guerlain", "Hermès", "Versace", 
  "Dolce & Gabbana", "Valentino", "Jean Paul Gaultier", "Viktor & Rolf", 
  "Montale", "Mancera", "Sospiro", "Tiziana Terenzi", "Zoologist", 
  "BDK Parfums", "Serge Lutens"
];

const SCENT_FAMILIES = ["Çiçeksi", "Odunsu", "Oryantal", "Fresh", "Baharatlı", "Gourmand"];
const SEASONS = ["Yaz", "Kış", "İlkbahar", "Sonbahar"];
const SIZES = ["3ml", "5ml", "10ml"];

export interface FilterState {
  gender: string;
  brands: string[];
  scents: string[];
  sizes: string[];
  seasons: string[];
  minPrice: number;
  maxPrice: number;
}

interface ProductFiltersProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
}

export default function ProductFilters({ filters, onChange }: ProductFiltersProps) {
  const [brandSearchQuery, setBrandSearchQuery] = useState("");

  const [openSection, setOpenSection] = useState({
    gender: true,
    brand: true,
    scent: false,
    price: true,
    size: false,
    season: false,
  });

  const toggleSection = (section: keyof typeof openSection) => {
    setOpenSection((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleGenderChange = (val: string) => {
    onChange({ ...filters, gender: filters.gender === val ? "" : val });
  };

  const handleCheckboxChange = (key: keyof FilterState, list: string[], item: string) => {
    const newList = list.includes(item)
      ? list.filter((i) => i !== item)
      : [...list, item];
    onChange({ ...filters, [key]: newList });
  };

  const handlePriceChange = (min: number, max: number) => {
    onChange({ ...filters, minPrice: min, maxPrice: max });
  };

  const filteredBrands = BRANDS.filter((brand) =>
    brand.toLowerCase().includes(brandSearchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#C9A84C]/10 select-none">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#C9A84C]/20 pb-5">
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <FiSliders className="text-[#C9A84C] w-5 h-5" strokeWidth={1.5} />
          <h3 className="font-playfair text-[15px] font-bold tracking-[0.2em] uppercase text-charcoal">FİLTRELER</h3>
        </div>
      </div>

      {/* 1. GENDER FILTER */}
      <div className={`border-b border-[#C9A84C]/10 pb-5 transition-all duration-300 ${openSection.gender ? "opacity-100" : "opacity-80"}`}>
        <button
          onClick={() => toggleSection("gender")}
          className="flex justify-between items-center w-full focus:outline-none group"
        >
          <span className="font-montserrat text-[11px] tracking-widest uppercase font-semibold text-charcoal group-hover:text-[#C9A84C] transition-colors">Cinsiyet</span>
          {openSection.gender ? <FiChevronUp className="text-[#C9A84C]" size={16} /> : <FiChevronDown className="text-charcoal/40 group-hover:text-[#C9A84C]" size={16} />}
        </button>
        <div className={`overflow-hidden transition-all duration-500 ease-in-out ${openSection.gender ? "max-h-40 mt-4 opacity-100" : "max-h-0 opacity-0"}`}>
          <div className="space-y-3">
            {[
              { label: "Erkek", val: "male" },
              { label: "Kadın", val: "female" },
              { label: "Unisex", val: "unisex" },
            ].map(({ label, val }) => {
              const isChecked = filters.gender === val;
              return (
                <label key={val} className="flex items-center space-x-3 rtl:space-x-reverse cursor-pointer group">
                  <div className={`relative flex items-center justify-center w-4 h-4 border rounded-full transition-colors ${isChecked ? 'border-[#C9A84C]' : 'border-charcoal/20 group-hover:border-[#C9A84C]'}`}>
                    <input type="radio" name="gender" checked={isChecked} onChange={() => handleGenderChange(val)} className="absolute inset-0 opacity-0 cursor-pointer peer" />
                    <div className={`pointer-events-none w-2 h-2 rounded-full bg-[#C9A84C] transition-all duration-300 ${isChecked ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`} />
                  </div>
                  <span className={`text-xs font-montserrat transition-colors duration-200 ${isChecked ? "text-charcoal font-semibold" : "text-charcoal/70 group-hover:text-charcoal"}`}>{label}</span>
                </label>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. PRICE RANGE FILTER */}
      <div className={`border-b border-[#C9A84C]/10 pb-5 transition-all duration-300 ${openSection.price ? "opacity-100" : "opacity-80"}`}>
        <button
          onClick={() => toggleSection("price")}
          className="flex justify-between items-center w-full focus:outline-none group"
        >
          <span className="font-montserrat text-[11px] tracking-widests uppercase font-semibold text-charcoal group-hover:text-[#C9A84C] transition-colors">Fiyat Aralığı</span>
          {openSection.price ? <FiChevronUp className="text-[#C9A84C]" size={16} /> : <FiChevronDown className="text-charcoal/40 group-hover:text-[#C9A84C]" size={16} />}
        </button>
        <div className={`overflow-hidden transition-all duration-500 ease-in-out ${openSection.price ? "max-h-40 mt-5 opacity-100" : "max-h-0 opacity-0"}`}>
          <div className="space-y-5 px-1">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 relative">
                <span className="absolute left-0 bottom-1.5 text-[10px] text-charcoal/50">₺</span>
                <input
                  type="number"
                  value={filters.minPrice}
                  min="0"
                  max="5000"
                  onChange={(e) => handlePriceChange(Number(e.target.value), filters.maxPrice)}
                  className="w-full bg-transparent border-b border-charcoal/20 text-xs font-montserrat py-1.5 pl-4 text-center text-charcoal font-semibold focus:outline-none focus:border-[#C9A84C] transition-colors"
                />
              </div>
              <div className="w-4 h-[1px] bg-charcoal/30 mt-4" />
              <div className="flex-1 relative">
                <span className="absolute left-0 bottom-1.5 text-[10px] text-charcoal/50">₺</span>
                <input
                  type="number"
                  value={filters.maxPrice}
                  min="0"
                  max="5000"
                  onChange={(e) => handlePriceChange(filters.minPrice, Number(e.target.value))}
                  className="w-full bg-transparent border-b border-charcoal/20 text-xs font-montserrat py-1.5 pl-4 text-center text-charcoal font-semibold focus:outline-none focus:border-[#C9A84C] transition-colors"
                />
              </div>
            </div>
            
            {/* Dual range slider */}
            <div className="relative pt-6 pb-2 px-1">
              <div className="relative h-1 w-full bg-gray-200 rounded-full">
                <div 
                  className="absolute h-full bg-[#C9A84C] rounded-full"
                  style={{
                    left: `${(filters.minPrice / 5000) * 100}%`,
                    right: `${100 - (filters.maxPrice / 5000) * 100}%`
                  }}
                />
                {/* Min Slider */}
                <input
                  type="range"
                  min="0"
                  max="5000"
                  step="50"
                  value={filters.minPrice}
                  onChange={(e) => {
                    const val = Math.min(Number(e.target.value), filters.maxPrice - 100);
                    handlePriceChange(val, filters.maxPrice);
                  }}
                  className="absolute top-1/2 -translate-y-1/2 left-0 w-full h-1 pointer-events-none appearance-none bg-transparent focus:outline-none 
                             [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#C9A84C] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:active:scale-125
                             [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[#C9A84C] [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:transition-transform [&::-moz-range-thumb]:active:scale-125"
                  style={{ zIndex: filters.minPrice > 4000 ? 5 : 3 }}
                />
                {/* Max Slider */}
                <input
                  type="range"
                  min="0"
                  max="5000"
                  step="50"
                  value={filters.maxPrice}
                  onChange={(e) => {
                    const val = Math.max(Number(e.target.value), filters.minPrice + 100);
                    handlePriceChange(filters.minPrice, val);
                  }}
                  className="absolute top-1/2 -translate-y-1/2 left-0 w-full h-1 pointer-events-none appearance-none bg-transparent focus:outline-none 
                             [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#C9A84C] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:active:scale-125
                             [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[#C9A84C] [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:transition-transform [&::-moz-range-thumb]:active:scale-125"
                  style={{ zIndex: 4 }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. BRAND FILTER */}
      <div className={`border-b border-[#C9A84C]/10 pb-5 transition-all duration-300 ${openSection.brand ? "opacity-100" : "opacity-80"}`}>
        <button
          onClick={() => toggleSection("brand")}
          className="flex justify-between items-center w-full focus:outline-none group"
        >
          <span className="font-montserrat text-[11px] tracking-widests uppercase font-semibold text-charcoal group-hover:text-[#C9A84C] transition-colors">Marka {filters.brands.length > 0 && <span className="text-[#C9A84C]">({filters.brands.length})</span>}</span>
          {openSection.brand ? <FiChevronUp className="text-[#C9A84C]" size={16} /> : <FiChevronDown className="text-charcoal/40 group-hover:text-[#C9A84C]" size={16} />}
        </button>
        <div className={`overflow-hidden transition-all duration-500 ease-in-out ${openSection.brand ? "max-h-[300px] mt-4 opacity-100" : "max-h-0 opacity-0"}`}>
          <div className="relative mb-4 group">
            <span className="absolute left-0 bottom-2 text-charcoal/40 group-focus-within:text-[#C9A84C] transition-colors">
              <FiSearch size={14} />
            </span>
            <input
              type="text"
              placeholder="Marka ara..."
              value={brandSearchQuery}
              onChange={(e) => setBrandSearchQuery(e.target.value)}
              className="w-full bg-transparent border-b border-charcoal/20 text-[11px] font-montserrat py-2 pl-6 pr-6 text-charcoal focus:outline-none focus:border-[#C9A84C] placeholder-charcoal/30 transition-colors"
            />
            {brandSearchQuery && (
              <button
                onClick={() => setBrandSearchQuery("")}
                className="absolute right-0 bottom-2 text-charcoal/40 hover:text-charcoal"
              >
                <FiX size={12} />
              </button>
            )}
          </div>
          <div className="max-h-36 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
            {filteredBrands.length === 0 ? (
              <p className="text-[10px] font-montserrat text-charcoal/50 italic py-2">Sonuç bulunamadı.</p>
            ) : (
              filteredBrands.map((b) => {
                const isChecked = filters.brands.includes(b);
                return (
                  <label key={b} className="flex items-center space-x-3 cursor-pointer group">
                    <div className={`relative flex items-center justify-center w-4 h-4 border transition-colors ${isChecked ? 'border-[#C9A84C] bg-[#C9A84C]' : 'border-charcoal/20 group-hover:border-[#C9A84C] bg-transparent'}`}>
                      <input type="checkbox" checked={isChecked} onChange={() => handleCheckboxChange("brands", filters.brands, b)} className="absolute inset-0 opacity-0 cursor-pointer peer" />
                      <FiCheck size={11} className={`text-white transition-opacity duration-200 ${isChecked ? 'opacity-100' : 'opacity-0'}`} strokeWidth={3} />
                    </div>
                    <span className={`text-[11px] font-montserrat transition-colors duration-200 ${isChecked ? "text-charcoal font-semibold" : "text-charcoal/70 group-hover:text-charcoal"}`}>{b}</span>
                  </label>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* 4. SCENT FAMILY FILTER */}
      <div className={`border-b border-[#C9A84C]/10 pb-5 transition-all duration-300 ${openSection.scent ? "opacity-100" : "opacity-80"}`}>
        <button
          onClick={() => toggleSection("scent")}
          className="flex justify-between items-center w-full focus:outline-none group"
        >
          <span className="font-montserrat text-[11px] tracking-widests uppercase font-semibold text-charcoal group-hover:text-[#C9A84C] transition-colors">Koku Ailesi {filters.scents.length > 0 && <span className="text-[#C9A84C]">({filters.scents.length})</span>}</span>
          {openSection.scent ? <FiChevronUp className="text-[#C9A84C]" size={16} /> : <FiChevronDown className="text-charcoal/40 group-hover:text-[#C9A84C]" size={16} />}
        </button>
        <div className={`overflow-hidden transition-all duration-500 ease-in-out ${openSection.scent ? "max-h-48 mt-4 opacity-100" : "max-h-0 opacity-0"}`}>
          <div className="space-y-3">
            {SCENT_FAMILIES.map((s) => {
              const isChecked = filters.scents.includes(s);
              return (
                <label key={s} className="flex items-center space-x-3 cursor-pointer group">
                  <div className={`relative flex items-center justify-center w-4 h-4 border transition-colors ${isChecked ? 'border-[#C9A84C] bg-[#C9A84C]' : 'border-charcoal/20 group-hover:border-[#C9A84C] bg-transparent'}`}>
                    <input type="checkbox" checked={isChecked} onChange={() => handleCheckboxChange("scents", filters.scents, s)} className="absolute inset-0 opacity-0 cursor-pointer peer" />
                    <FiCheck size={11} className={`text-white transition-opacity duration-200 ${isChecked ? 'opacity-100' : 'opacity-0'}`} strokeWidth={3} />
                  </div>
                  <span className={`text-[11px] font-montserrat transition-colors duration-200 ${isChecked ? "text-charcoal font-semibold" : "text-charcoal/70 group-hover:text-charcoal"}`}>{s}</span>
                </label>
              );
            })}
          </div>
        </div>
      </div>

      {/* 5. SIZE FILTER */}
      <div className={`border-b border-[#C9A84C]/10 pb-5 transition-all duration-300 ${openSection.size ? "opacity-100" : "opacity-80"}`}>
        <button
          onClick={() => toggleSection("size")}
          className="flex justify-between items-center w-full focus:outline-none group"
        >
          <span className="font-montserrat text-[11px] tracking-widests uppercase font-semibold text-charcoal group-hover:text-[#C9A84C] transition-colors">Boyut {filters.sizes.length > 0 && <span className="text-[#C9A84C]">({filters.sizes.length})</span>}</span>
          {openSection.size ? <FiChevronUp className="text-[#C9A84C]" size={16} /> : <FiChevronDown className="text-charcoal/40 group-hover:text-[#C9A84C]" size={16} />}
        </button>
        <div className={`overflow-hidden transition-all duration-500 ease-in-out ${openSection.size ? "max-h-40 mt-4 opacity-100" : "max-h-0 opacity-0"}`}>
          <div className="space-y-3">
            {SIZES.map((sz) => {
              const isChecked = filters.sizes.includes(sz);
              return (
                <label key={sz} className="flex items-center space-x-3 cursor-pointer group">
                  <div className={`relative flex items-center justify-center w-4 h-4 border transition-colors ${isChecked ? 'border-[#C9A84C] bg-[#C9A84C]' : 'border-charcoal/20 group-hover:border-[#C9A84C] bg-transparent'}`}>
                    <input type="checkbox" checked={isChecked} onChange={() => handleCheckboxChange("sizes", filters.sizes, sz)} className="absolute inset-0 opacity-0 cursor-pointer peer" />
                    <FiCheck size={11} className={`text-white transition-opacity duration-200 ${isChecked ? 'opacity-100' : 'opacity-0'}`} strokeWidth={3} />
                  </div>
                  <span className={`text-[11px] font-montserrat transition-colors duration-200 ${isChecked ? "text-charcoal font-semibold" : "text-charcoal/70 group-hover:text-charcoal"}`}>{sz}</span>
                </label>
              );
            })}
          </div>
        </div>
      </div>

      {/* 6. SEASON FILTER */}
      <div className={`transition-all duration-300 ${openSection.season ? "opacity-100" : "opacity-80"}`}>
        <button
          onClick={() => toggleSection("season")}
          className="flex justify-between items-center w-full focus:outline-none group"
        >
          <span className="font-montserrat text-[11px] tracking-widests uppercase font-semibold text-charcoal group-hover:text-[#C9A84C] transition-colors">Mevsim {filters.seasons.length > 0 && <span className="text-[#C9A84C]">({filters.seasons.length})</span>}</span>
          {openSection.season ? <FiChevronUp className="text-[#C9A84C]" size={16} /> : <FiChevronDown className="text-charcoal/40 group-hover:text-[#C9A84C]" size={16} />}
        </button>
        <div className={`overflow-hidden transition-all duration-500 ease-in-out ${openSection.season ? "max-h-40 mt-4 opacity-100" : "max-h-0 opacity-0"}`}>
          <div className="space-y-3">
            {SEASONS.map((sn) => {
              const isChecked = filters.seasons.includes(sn);
              return (
                <label key={sn} className="flex items-center space-x-3 cursor-pointer group">
                  <div className={`relative flex items-center justify-center w-4 h-4 border transition-colors ${isChecked ? 'border-[#C9A84C] bg-[#C9A84C]' : 'border-charcoal/20 group-hover:border-[#C9A84C] bg-transparent'}`}>
                    <input type="checkbox" checked={isChecked} onChange={() => handleCheckboxChange("seasons", filters.seasons, sn)} className="absolute inset-0 opacity-0 cursor-pointer peer" />
                    <FiCheck size={11} className={`text-white transition-opacity duration-200 ${isChecked ? 'opacity-100' : 'opacity-0'}`} strokeWidth={3} />
                  </div>
                  <span className={`text-[11px] font-montserrat transition-colors duration-200 ${isChecked ? "text-charcoal font-semibold" : "text-charcoal/70 group-hover:text-charcoal"}`}>{sn}</span>
                </label>
              );
            })}
          </div>
        </div>
      </div>

    </div>
  );
}
