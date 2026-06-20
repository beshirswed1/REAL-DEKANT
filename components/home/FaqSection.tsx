"use client";

import { useState } from "react";

interface FaqItem {
  question: string;
  answer: string;
}

interface FaqSectionProps {
  items: FaqItem[];
}

function FaqAccordionItem({
  item,
  index,
  isOpen,
  onToggle,
}: {
  item: FaqItem;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className={`group border border-[#C9A84C]/15 rounded-2xl overflow-hidden transition-all duration-500 ${
        isOpen
          ? "bg-white/80 shadow-[0_8px_30px_rgba(201,168,76,0.08)] border-[#C9A84C]/30"
          : "bg-white/40 hover:bg-white/60 hover:border-[#C9A84C]/25"
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center gap-4 px-5 sm:px-7 py-5 sm:py-6 text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A84C]/40 focus-visible:ring-offset-2 rounded-2xl"
        aria-expanded={isOpen}
      >
        {/* Number Badge */}
        <span
          className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 ${
            isOpen
              ? "bg-[#C9A84C] text-[#0D0D0D] shadow-md shadow-[#C9A84C]/30"
              : "bg-[#C9A84C]/10 text-[#C9A84C] group-hover:bg-[#C9A84C]/20"
          }`}
        >
          {String(index + 1).padStart(2, "0")}
        </span>

        {/* Question */}
        <span
          className={`flex-1 font-montserrat text-sm sm:text-[15px] font-semibold tracking-wide leading-snug transition-colors duration-300 ${
            isOpen ? "text-[#1A1A1A]" : "text-[#333] group-hover:text-[#1A1A1A]"
          }`}
        >
          {item.question}
        </span>

        {/* Arrow Icon */}
        <span
          className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 ${
            isOpen
              ? "bg-[#C9A84C]/10 rotate-180"
              : "bg-gray-100 group-hover:bg-[#C9A84C]/10"
          }`}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke={isOpen ? "#C9A84C" : "#999"}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-4 h-4 transition-colors duration-300"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      </button>

      {/* Answer Panel */}
      <div
        className={`overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
          isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-5 sm:px-7 pb-6 pt-0">
          <div className="pl-12">
            {/* Gold accent line */}
            <div className="w-8 h-[2px] bg-gradient-to-r from-[#C9A84C] to-[#C9A84C]/30 rounded-full mb-3" />
            <p className="font-montserrat text-[13px] sm:text-sm text-[#555] leading-[1.85] tracking-wide whitespace-pre-line">
              {item.answer}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FaqSection({ items }: FaqSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  if (!items || items.length === 0) return null;

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  // Split items into two columns on large screens
  const midpoint = Math.ceil(items.length / 2);
  const leftColumn = items.slice(0, midpoint);
  const rightColumn = items.slice(midpoint);

  return (
    <section className="bg-[#FAF7F0] py-20 sm:py-28 relative overflow-hidden">
      {/* Subtle decorative patterns */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-[radial-gradient(circle,_#C9A84C08_0%,_transparent_70%)] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-[radial-gradient(circle,_#C9A84C06_0%,_transparent_70%)] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <div className="text-center space-y-3 mb-14 sm:mb-16">
          <span className="font-montserrat text-[10px] tracking-[0.3em] text-[#C9A84C] uppercase font-bold">
            Sıkça Sorulan Sorular
          </span>
          <h2 className="font-playfair text-2xl sm:text-3xl lg:text-4xl font-bold tracking-wide uppercase text-[#1A1A1A]">
            Merak Edilenler
          </h2>
          <div className="flex justify-center items-center gap-2 mt-3">
            <div className="h-[1px] w-8 bg-[#C9A84C]/45" />
            <div className="w-1.5 h-1.5 rounded-full bg-[#C9A84C]" />
            <div className="h-[1px] w-8 bg-[#C9A84C]/45" />
          </div>
          <p className="font-montserrat text-sm text-[#777] max-w-lg mx-auto leading-relaxed mt-2">
            Dekant parfüm dünyasına dair en çok merak edilen soruların cevaplarını burada bulabilirsiniz.
          </p>
        </div>

        {/* FAQ Items — Single column on mobile, two columns on lg+ */}
        {items.length <= 4 ? (
          // Single centered column for few items
          <div className="max-w-2xl mx-auto space-y-3">
            {items.map((item, i) => (
              <FaqAccordionItem
                key={i}
                item={item}
                index={i}
                isOpen={openIndex === i}
                onToggle={() => handleToggle(i)}
              />
            ))}
          </div>
        ) : (
          // Two columns for many items
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-5">
            <div className="space-y-3">
              {leftColumn.map((item, i) => (
                <FaqAccordionItem
                  key={i}
                  item={item}
                  index={i}
                  isOpen={openIndex === i}
                  onToggle={() => handleToggle(i)}
                />
              ))}
            </div>
            <div className="space-y-3">
              {rightColumn.map((item, i) => {
                const actualIndex = midpoint + i;
                return (
                  <FaqAccordionItem
                    key={actualIndex}
                    item={item}
                    index={actualIndex}
                    isOpen={openIndex === actualIndex}
                    onToggle={() => handleToggle(actualIndex)}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* Bottom decorative element */}
        <div className="flex justify-center mt-14 sm:mt-16">
          <div className="flex items-center gap-3">
            <div className="h-[1px] w-12 bg-[#C9A84C]/25" />
            <svg viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="1.5" className="w-5 h-5 opacity-40">
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <div className="h-[1px] w-12 bg-[#C9A84C]/25" />
          </div>
        </div>
      </div>
    </section>
  );
}
