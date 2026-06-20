"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";

interface HeroSlide {
  image: string;
  label: string;
  headline: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
}

const DEFAULT_SLIDES: HeroSlide[] = [
  {
    image: "/images/hero-1.png",
    label: "Görünmez Bir İzahtır Koku",
    headline: "REAL DEKANT",
    subtitle: "Görünmez Ama Unutulmaz",
    ctaText: "Mağazayı Keşfet",
    ctaLink: "/shop",
  },
  {
    image: "/images/hero-2.png",
    label: "Lüks Koleksiyon",
    headline: "NİŞ KOKULAR\nUYGUN FİYATLAR",
    subtitle: "Lüks parfümleri deneme boyunda keşfedin",
    ctaText: "Koleksiyonu İncele",
    ctaLink: "/shop",
  },
  {
    image: "/images/hero-3.png",
    label: "%100 Orijinal",
    headline: "STERİL VE\nGÜVENLİ",
    subtitle: "Sızdırmaz şişelerle güvenli alışveriş deneyimi",
    ctaText: "Hemen Alışveriş Yap",
    ctaLink: "/shop",
  },
];

interface HeroCarouselProps {
  slidesData?: HeroSlide[];
}

export default function HeroCarousel({ slidesData }: HeroCarouselProps) {
  const activeSlides = slidesData && slidesData.length > 0 ? slidesData : DEFAULT_SLIDES;

  const [current, setCurrent] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const isPaused = useRef(false);

  const goToSlide = useCallback(
    (index: number) => {
      if (isTransitioning) return;
      setIsTransitioning(true);
      setCurrent(index);
      setTimeout(() => setIsTransitioning(false), 800);
    },
    [isTransitioning]
  );

  const nextSlide = useCallback(() => {
    goToSlide((current + 1) % activeSlides.length);
  }, [current, goToSlide, activeSlides.length]);

  const prevSlide = useCallback(() => {
    goToSlide((current - 1 + activeSlides.length) % activeSlides.length);
  }, [current, goToSlide, activeSlides.length]);

  // Auto-rotation
  useEffect(() => {
    const startInterval = () => {
      intervalRef.current = setInterval(() => {
        if (!isPaused.current) {
          setCurrent((prev) => {
            const next = (prev + 1) % activeSlides.length;
            return next;
          });
        }
      }, 5500);
    };

    startInterval();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [activeSlides.length]);

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) nextSlide();
      else prevSlide();
    }
  };

  const currentSlide = activeSlides[current];

  return (
    <section
      className="relative bg-[#0D0D0D] overflow-hidden border-b border-[#C9A84C]/20"
      onMouseEnter={() => (isPaused.current = true)}
      onMouseLeave={() => (isPaused.current = false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Subtle radial glow */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#C9A84C] via-transparent to-transparent" />

      <div className="relative max-w-7xl mx-auto min-h-auto md:min-h-[600px] lg:min-h-[650px]">
        <div className="grid grid-cols-1 md:grid-cols-2 items-stretch min-h-auto md:min-h-[600px] lg:min-h-[650px]">
          
          {/* Left: Image Panel */}
          <div className="relative h-[280px] sm:h-[360px] md:h-auto overflow-hidden">
            {activeSlides.map((slide, i) => (
              <div
                key={i}
                className={`absolute inset-0 transition-all duration-[900ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)] ${
                  i === current
                    ? "opacity-100 scale-100"
                    : "opacity-0 scale-105"
                }`}
              >
                <Image
                  src={slide.image}
                  alt={slide.headline}
                  fill
                  priority={i === 0}
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover object-center"
                />
                {/* Dark gradient overlay from bottom */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0D]/60 via-transparent to-[#0D0D0D]/20 md:bg-gradient-to-r md:from-transparent md:via-transparent md:to-[#0D0D0D]/80" />
              </div>
            ))}

            {/* Gold accent line at bottom on mobile / right on desktop */}
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#C9A84C]/50 to-transparent md:hidden" />
            <div className="hidden md:block absolute top-0 bottom-0 right-0 w-[2px] bg-gradient-to-b from-transparent via-[#C9A84C]/30 to-transparent" />
          </div>

          {/* Right: Text Panel */}
          <div className="flex items-center justify-center px-5 sm:px-10 lg:px-16 py-7 sm:py-10 md:py-0">
            <div className="text-center md:text-left max-w-md space-y-3 sm:space-y-5 relative z-10">
              {/* Label */}
              <div className="overflow-hidden">
                <span
                  key={`label-${current}`}
                  className="font-montserrat text-[10px] sm:text-xs tracking-[0.45em] text-[#C9A84C] uppercase block animate-fade-in"
                >
                  {currentSlide.label}
                </span>
              </div>

              {/* Headline */}
              <div className="overflow-hidden">
                <h1
                  key={`headline-${current}`}
                  className="font-playfair text-2xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-[0.06em] text-[#F8F3E8] uppercase leading-[1.15] whitespace-pre-line animate-fade-in"
                  style={{ animationDelay: "100ms" }}
                >
                  {currentSlide.headline}
                </h1>
              </div>

              {/* Subtitle */}
              <div className="overflow-hidden">
                <p
                  key={`subtitle-${current}`}
                  className="font-dancing text-lg sm:text-2xl text-[#C9A84C] italic animate-fade-in"
                  style={{ animationDelay: "200ms" }}
                >
                  &ldquo;{currentSlide.subtitle}&rdquo;
                </p>
              </div>

              {/* CTA */}
              <div
                key={`cta-${current}`}
                className="pt-2 sm:pt-4 animate-fade-in"
                style={{ animationDelay: "300ms" }}
              >
                <Link
                  href={currentSlide.ctaLink}
                  className="inline-block btn-luxury-outline px-6 py-3 sm:px-8 sm:py-4 text-[9px] sm:text-[10px] tracking-[0.25em] hover:text-[#FAF7F0] hover:bg-gold"
                >
                  {currentSlide.ctaText}
                </Link>
              </div>

              {/* Dots Navigation */}
              <div className="flex items-center gap-3 pt-4 sm:pt-6 md:justify-start justify-center">
                {activeSlides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => goToSlide(i)}
                    className={`relative h-[3px] rounded-full transition-all duration-500 ${
                      i === current
                        ? "w-10 bg-[#C9A84C]"
                        : "w-5 bg-[#F8F3E8]/25 hover:bg-[#F8F3E8]/45"
                    }`}
                    aria-label={`Slide ${i + 1}`}
                  />
                ))}
                <span className="ml-3 font-montserrat text-[10px] tracking-widest text-[#F8F3E8]/40">
                  {String(current + 1).padStart(2, "0")} / {String(activeSlides.length).padStart(2, "0")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Arrow Navigation — Desktop Only */}
      <button
        onClick={prevSlide}
        className="hidden md:flex absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 z-20 w-11 h-11 items-center justify-center border border-[#C9A84C]/25 text-[#F8F3E8]/60 hover:text-[#C9A84C] hover:border-[#C9A84C]/60 transition-all duration-300 rounded-full backdrop-blur-sm bg-[#0D0D0D]/30"
        aria-label="Previous slide"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
      <button
        onClick={nextSlide}
        className="hidden md:flex absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 z-20 w-11 h-11 items-center justify-center border border-[#C9A84C]/25 text-[#F8F3E8]/60 hover:text-[#C9A84C] hover:border-[#C9A84C]/60 transition-all duration-300 rounded-full backdrop-blur-sm bg-[#0D0D0D]/30"
        aria-label="Next slide"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
    </section>
  );
}
