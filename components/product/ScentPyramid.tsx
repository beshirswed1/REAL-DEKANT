import React from "react";
import type { ScentNotes } from "@/types";

interface ScentPyramidProps {
  notes: ScentNotes;
}

export default function ScentPyramid({ notes }: ScentPyramidProps) {
  const topNotesList = notes.top && notes.top.length > 0 ? notes.top : ["Meyvemsi, Taze Notalar"];
  const heartNotesList = notes.heart && notes.heart.length > 0 ? notes.heart : ["Çiçeksi, Baharat Notaları"];
  const baseNotesList = notes.base && notes.base.length > 0 ? notes.base : ["Odunsu, Misk Notaları"];

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="text-center space-y-2 mb-10">
        <span className="font-montserrat text-[9px] tracking-[0.3em] text-[#C9A84C] uppercase font-semibold block">
          Koku Bileşenleri
        </span>
        <h3 className="font-playfair text-xl sm:text-2xl font-bold uppercase tracking-wider text-charcoal">
          Koku Piramidi
        </h3>
        <div className="h-0.5 w-12 bg-[#C9A84C]/45 mx-auto mt-2" />
      </div>

      {/* Styled Minimalist Pyramid with gold axis line */}
      <div className="relative flex flex-col items-center justify-center space-y-5 max-w-lg mx-auto py-6 select-none">
        
        {/* Central Gold Spindle Axis */}
        <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-gradient-to-b from-[#C9A84C] via-[#C9A84C]/35 to-transparent transform -translate-x-1/2 pointer-events-none" />
        <div className="absolute left-1/2 top-0 w-2 h-2 bg-[#C9A84C] transform -translate-x-1/2 rotate-45 -translate-y-1 z-10 pointer-events-none" />

        {/* Tier 1: Üst Notalar (Top) */}
        <div className="w-[50%] bg-white border border-[#C9A84C]/40 py-4 px-3 text-center transition-all duration-300 hover:border-[#C9A84C] hover:shadow-[0_0_15px_rgba(201,168,76,0.15)] relative group z-10">
          <div className="absolute inset-0 bg-gradient-to-r from-[#C9A84C]/0 via-[#C9A84C]/5 to-[#C9A84C]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          <span className="font-montserrat text-[10px] tracking-widest text-[#C9A84C] uppercase font-bold block mb-1">
            Üst Notalar
          </span>
          <p className="font-montserrat text-xs text-charcoal/80 leading-relaxed font-medium">
            {topNotesList.join(" • ")}
          </p>
        </div>

        {/* Tier 2: Orta Notalar (Heart) */}
        <div className="w-[75%] bg-white border border-[#C9A84C]/35 py-5 px-4 text-center transition-all duration-300 hover:border-[#C9A84C] hover:shadow-[0_0_15px_rgba(201,168,76,0.15)] relative group z-10">
          <div className="absolute inset-0 bg-gradient-to-r from-[#C9A84C]/0 via-[#C9A84C]/5 to-[#C9A84C]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          <span className="font-montserrat text-[10px] tracking-widest text-[#C9A84C] uppercase font-bold block mb-1">
            Orta Notalar
          </span>
          <p className="font-montserrat text-xs text-charcoal/80 leading-relaxed font-medium">
            {heartNotesList.join(" • ")}
          </p>
        </div>

        {/* Tier 3: Alt Notalar (Base) */}
        <div className="w-full bg-white border border-[#C9A84C]/30 py-6 px-5 text-center transition-all duration-300 hover:border-[#C9A84C] hover:shadow-[0_0_15px_rgba(201,168,76,0.15)] relative group z-10">
          <div className="absolute inset-0 bg-gradient-to-r from-[#C9A84C]/0 via-[#C9A84C]/5 to-[#C9A84C]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          <span className="font-montserrat text-[10px] tracking-widest text-[#C9A84C] uppercase font-bold block mb-1">
            Alt Notalar
          </span>
          <p className="font-montserrat text-xs text-charcoal/80 leading-relaxed font-medium">
            {baseNotesList.join(" • ")}
          </p>
        </div>

      </div>

    </div>
  );
}
