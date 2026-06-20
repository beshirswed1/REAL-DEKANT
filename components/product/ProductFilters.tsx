"use client";

import React, { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
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

export default function ProductFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

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

  const updateQuery = (key: string, value: string | string[], isDelete = false) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page");
    if (isDelete) {
      params.delete(key);
    } else if (Array.isArray(value)) {
      params.delete(key);
      value.forEach((v) => params.append(key, v));
    } else {
      params.set(key, value);
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const selectedGender = searchParams.get("gender") || "";
  const selectedBrands = searchParams.getAll("brand");
  const selectedScents = searchParams.getAll("scent");
  const selectedSizes = searchParams.getAll("size");
  const selectedSeasons = searchParams.getAll("season");
  const minPrice = searchParams.get("minPrice") || "0";
  const maxPrice = searchParams.get("maxPrice") || "5000";

  const handleGenderChange = (val: string) => {
    if (val === selectedGender) {
      updateQuery("gender", "", true);
    } else {
      updateQuery("gender", val);
    }
  };

  const handleCheckboxChange = (key: string, list: string[], item: string) => {
    const newList = list.includes(item)
      ? list.filter((i) => i !== item)
      : [...list, item];
    
    if (newList.length === 0) {
      updateQuery(key, "", true);
    } else {
      updateQuery(key, newList);
    }
  };

  const handlePriceChange = (min: string, max: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("minPrice", min);
    params.set("maxPrice", max);
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
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
            {["Erkek", "Kadın", "Unisex"].map((g) => {
              const val = g.toLowerCase();
              const isChecked = selectedGender === val;
              return (
                <label key={g} className="flex items-center space-x-3 rtl:space-x-reverse cursor-pointer group">
                  <div className={`relative flex items-center justify-center w-4 h-4 border rounded-full transition-colors ${isChecked ? 'border-[#C9A84C]' : 'border-charcoal/20 group-hover:border-[#C9A84C]'}`}>
                    <input type="radio" name="gender" checked={isChecked} onChange={() => handleGenderChange(val)} className="absolute inset-0 opacity-0 cursor-pointer peer" />
                    <div className={`pointer-events-none w-2 h-2 rounded-full bg-[#C9A84C] transition-all duration-300 ${isChecked ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`} />
                  </div>
                  <span className={`text-xs font-montserrat transition-colors duration-200 ${isChecked ? "text-charcoal font-semibold" : "text-charcoal/70 group-hover:text-charcoal"}`}>{g}</span>
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
          <span className="font-montserrat text-[11px] tracking-widest uppercase font-semibold text-charcoal group-hover:text-[#C9A84C] transition-colors">Fiyat Aralığı</span>
          {openSection.price ? <FiChevronUp className="text-[#C9A84C]" size={16} /> : <FiChevronDown className="text-charcoal/40 group-hover:text-[#C9A84C]" size={16} />}
        </button>
        <div className={`overflow-hidden transition-all duration-500 ease-in-out ${openSection.price ? "max-h-40 mt-5 opacity-100" : "max-h-0 opacity-0"}`}>
          <div className="space-y-5 px-1">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 relative">
                <span className="absolute left-0 bottom-1.5 text-[10px] text-charcoal/50">₺</span>
                <input
                  type="number"
                  value={minPrice}
                  min="0"
                  max="5000"
                  onChange={(e) => handlePriceChange(e.target.value, maxPrice)}
                  className="w-full bg-transparent border-b border-charcoal/20 text-xs font-montserrat py-1.5 pl-4 text-center text-charcoal font-semibold focus:outline-none focus:border-[#C9A84C] transition-colors"
                />
              </div>
              <div className="w-4 h-[1px] bg-charcoal/30 mt-4" />
              <div className="flex-1 relative">
                <span className="absolute left-0 bottom-1.5 text-[10px] text-charcoal/50">₺</span>
                <input
                  type="number"
                  value={maxPrice}
                  min="0"
                  max="5000"
                  onChange={(e) => handlePriceChange(minPrice, e.target.value)}
                  className="w-full bg-transparent border-b border-charcoal/20 text-xs font-montserrat py-1.5 pl-4 text-center text-charcoal font-semibold focus:outline-none focus:border-[#C9A84C] transition-colors"
                />
              </div>
            </div>
            
            {/* Custom styled range slider container */}
            <div className="pt-2">
              <input
                type="range"
                min="0"
                max="5000"
                value={maxPrice}
                onChange={(e) => handlePriceChange(minPrice, e.target.value)}
                className="w-full h-1 bg-charcoal/10 rounded-none appearance-none cursor-pointer accent-[#C9A84C]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3. BRAND FILTER (with Search Input) */}
      <div className={`border-b border-[#C9A84C]/10 pb-5 transition-all duration-300 ${openSection.brand ? "opacity-100" : "opacity-80"}`}>
        <button
          onClick={() => toggleSection("brand")}
          className="flex justify-between items-center w-full focus:outline-none group"
        >
          <span className="font-montserrat text-[11px] tracking-widest uppercase font-semibold text-charcoal group-hover:text-[#C9A84C] transition-colors">Marka {selectedBrands.length > 0 && <span className="text-[#C9A84C]">({selectedBrands.length})</span>}</span>
          {openSection.brand ? <FiChevronUp className="text-[#C9A84C]" size={16} /> : <FiChevronDown className="text-charcoal/40 group-hover:text-[#C9A84C]" size={16} />}
        </button>
        <div className={`overflow-hidden transition-all duration-500 ease-in-out ${openSection.brand ? "max-h-[300px] mt-4 opacity-100" : "max-h-0 opacity-0"}`}>
          {/* Brand Search Box */}
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

          {/* Scrollable list */}
          <div className="max-h-36 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
            {filteredBrands.length === 0 ? (
              <p className="text-[10px] font-montserrat text-charcoal/50 italic py-2">
                Sonuç bulunamadı.
              </p>
            ) : (
              filteredBrands.map((b) => {
                const isChecked = selectedBrands.includes(b);
                return (
                  <label key={b} className="flex items-center space-x-3 cursor-pointer group">
                    <div className={`relative flex items-center justify-center w-4 h-4 border transition-colors ${isChecked ? 'border-[#C9A84C] bg-[#C9A84C]' : 'border-charcoal/20 group-hover:border-[#C9A84C] bg-transparent'}`}>
                      <input type="checkbox" checked={isChecked} onChange={() => handleCheckboxChange("brand", selectedBrands, b)} className="absolute inset-0 opacity-0 cursor-pointer peer" />
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
          <span className="font-montserrat text-[11px] tracking-widest uppercase font-semibold text-charcoal group-hover:text-[#C9A84C] transition-colors">Koku Ailesi {selectedScents.length > 0 && <span className="text-[#C9A84C]">({selectedScents.length})</span>}</span>
          {openSection.scent ? <FiChevronUp className="text-[#C9A84C]" size={16} /> : <FiChevronDown className="text-charcoal/40 group-hover:text-[#C9A84C]" size={16} />}
        </button>
        <div className={`overflow-hidden transition-all duration-500 ease-in-out ${openSection.scent ? "max-h-48 mt-4 opacity-100" : "max-h-0 opacity-0"}`}>
          <div className="space-y-3">
            {SCENT_FAMILIES.map((s) => {
              const isChecked = selectedScents.includes(s);
              return (
                <label key={s} className="flex items-center space-x-3 cursor-pointer group">
                  <div className={`relative flex items-center justify-center w-4 h-4 border transition-colors ${isChecked ? 'border-[#C9A84C] bg-[#C9A84C]' : 'border-charcoal/20 group-hover:border-[#C9A84C] bg-transparent'}`}>
                    <input type="checkbox" checked={isChecked} onChange={() => handleCheckboxChange("scent", selectedScents, s)} className="absolute inset-0 opacity-0 cursor-pointer peer" />
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
          <span className="font-montserrat text-[11px] tracking-widest uppercase font-semibold text-charcoal group-hover:text-[#C9A84C] transition-colors">Boyut {selectedSizes.length > 0 && <span className="text-[#C9A84C]">({selectedSizes.length})</span>}</span>
          {openSection.size ? <FiChevronUp className="text-[#C9A84C]" size={16} /> : <FiChevronDown className="text-charcoal/40 group-hover:text-[#C9A84C]" size={16} />}
        </button>
        <div className={`overflow-hidden transition-all duration-500 ease-in-out ${openSection.size ? "max-h-40 mt-4 opacity-100" : "max-h-0 opacity-0"}`}>
          <div className="space-y-3">
            {SIZES.map((sz) => {
              const isChecked = selectedSizes.includes(sz);
              return (
                <label key={sz} className="flex items-center space-x-3 cursor-pointer group">
                  <div className={`relative flex items-center justify-center w-4 h-4 border transition-colors ${isChecked ? 'border-[#C9A84C] bg-[#C9A84C]' : 'border-charcoal/20 group-hover:border-[#C9A84C] bg-transparent'}`}>
                    <input type="checkbox" checked={isChecked} onChange={() => handleCheckboxChange("size", selectedSizes, sz)} className="absolute inset-0 opacity-0 cursor-pointer peer" />
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
          <span className="font-montserrat text-[11px] tracking-widest uppercase font-semibold text-charcoal group-hover:text-[#C9A84C] transition-colors">Mevsim {selectedSeasons.length > 0 && <span className="text-[#C9A84C]">({selectedSeasons.length})</span>}</span>
          {openSection.season ? <FiChevronUp className="text-[#C9A84C]" size={16} /> : <FiChevronDown className="text-charcoal/40 group-hover:text-[#C9A84C]" size={16} />}
        </button>
        <div className={`overflow-hidden transition-all duration-500 ease-in-out ${openSection.season ? "max-h-40 mt-4 opacity-100" : "max-h-0 opacity-0"}`}>
          <div className="space-y-3">
            {SEASONS.map((sn) => {
              const isChecked = selectedSeasons.includes(sn);
              return (
                <label key={sn} className="flex items-center space-x-3 cursor-pointer group">
                  <div className={`relative flex items-center justify-center w-4 h-4 border transition-colors ${isChecked ? 'border-[#C9A84C] bg-[#C9A84C]' : 'border-charcoal/20 group-hover:border-[#C9A84C] bg-transparent'}`}>
                    <input type="checkbox" checked={isChecked} onChange={() => handleCheckboxChange("season", selectedSeasons, sn)} className="absolute inset-0 opacity-0 cursor-pointer peer" />
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
