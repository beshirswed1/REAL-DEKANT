"use client";

import React, { useState } from "react";
import Image from "next/image";

import { getOptimizedImage } from "@/lib/imgbb/config";

interface ProductGalleryProps {
  images: (string | { url: string; publicId?: string; alt?: string })[];
  altText: string;
}

export default function ProductGallery({ images, altText }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  // Normalize images to string URLs
  const normalizeImg = (img: string | { url: string }): string => {
    if (typeof img === "string") return img;
    return img.url || "";
  };

  const displayImages = images && images.length > 0
    ? images.map(normalizeImg)
    : ["https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=800"];

  const activeImageSrc = displayImages[activeIndex];

  return (
    <div className="space-y-4">
      
      {/* Main Showcase Image (with hover zoom effect) */}
      <div className="relative aspect-square w-full overflow-hidden border border-[#C9A84C]/15 bg-white group cursor-zoom-in">
        <Image
          src={getOptimizedImage(activeImageSrc, "full")}
          alt={altText}
          fill
          priority
          sizes="(max-w-768px) 100vw, 60vw"
          className="object-cover object-center transition-transform duration-500 group-hover:scale-110"
        />
      </div>

      {/* Thumbnails Row */}
      {displayImages.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-thin">
          {displayImages.map((imgSrc, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={`relative aspect-square w-20 flex-shrink-0 border overflow-hidden transition-all duration-300 ${
                activeIndex === idx
                  ? "border-[#C9A84C] ring-1 ring-[#C9A84C]/50"
                  : "border-charcoal/15 opacity-70 hover:opacity-100"
              }`}
            >
              <Image
                src={getOptimizedImage(imgSrc, "thumb")}
                alt={`${altText} Thumbnail ${idx + 1}`}
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

    </div>
  );
}
