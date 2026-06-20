"use client";

import React from "react";

interface BrandsMarqueeProps {
  brands: string[];
}

export default function BrandsMarquee({ brands }: BrandsMarqueeProps) {
  // Duplicate for seamless loop
  const allBrands = [...brands, ...brands];

  return (
    <section className="bg-white border-y border-[#C9A84C]/10 py-8 sm:py-10 overflow-hidden relative">
      {/* Fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-24 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-24 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

      {/* Marquee track */}
      <div className="flex animate-marquee hover:[animation-play-state:paused] whitespace-nowrap">
        {allBrands.map((brand, i) => (
          <React.Fragment key={`${brand}-${i}`}>
            <span className="font-playfair text-sm sm:text-base tracking-[0.2em] text-charcoal/40 uppercase font-semibold hover:text-[#C9A84C] transition-colors duration-300 cursor-default flex-shrink-0 px-2">
              {brand}
            </span>
            <span className="text-[#C9A84C]/40 mx-4 sm:mx-6 flex-shrink-0 text-xs self-center select-none">
              ✦
            </span>
          </React.Fragment>
        ))}
      </div>
    </section>
  );
}
