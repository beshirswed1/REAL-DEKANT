"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import { toggleWishlist } from "@/store/slices/wishlistSlice";
import { addToCart } from "@/store/slices/cartSlice";
import type { RootState } from "@/store";
import { FiHeart, FiShoppingBag } from "react-icons/fi";
import { FaHeart } from "react-icons/fa";
import type { Product, PriceSize } from "@/types";
import Link from "next/link";
import { getOptimizedImage } from "@/lib/imgbb/config";

interface ProductCardProps {
  product: Product;
}

const SIZE_OPTIONS: PriceSize[] = ["3ml", "5ml", "10ml"];

export default function ProductCard({ product }: ProductCardProps) {
  const dispatch = useDispatch();
  const [selectedSize, setSelectedSize] = useState<PriceSize>("5ml");
  const [isAdding, setIsAdding] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const displayImage = getOptimizedImage(product.images?.[0], "card");

  const hasImage = !imageError && !!displayImage;

  const isWishlisted = useSelector((state: RootState) =>
    state.wishlist.items.some((i) => i.productId === product.id)
  );

  // Find lowest price for wishlist
  const lowestPrice = Math.min(
    product.prices["3ml"] || 9999,
    product.prices["5ml"] || 9999,
    product.prices["10ml"] || 9999
  );

  const currentPrice = product.prices[selectedSize] || 0;

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(
      toggleWishlist({
        productId: product.id,
        perfumeName: product.perfumeName,
        brand: product.brand,
        image: displayImage,
        price: lowestPrice === 9999 ? 0 : lowestPrice,
        slug: product.slug,
      })
    );
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock === 0) return;

    setIsAdding(true);
    dispatch(
      addToCart({
        id: `${product.id}_${selectedSize}`,
        productId: product.id,
        sku: product.sku,
        perfumeName: product.perfumeName,
        brand: product.brand,
        size: selectedSize,
        price: currentPrice,
        qty: 1,
        image: displayImage,
        slug: product.slug,
      })
    );

    setTimeout(() => setIsAdding(false), 1200);
  };

  const handleSizeClick = (e: React.MouseEvent, size: PriceSize) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedSize(size);
  };

  const genderLabel =
    product.gender === "male"
      ? "Erkek"
      : product.gender === "female"
      ? "Kadın"
      : "Unisex";

  return (
    <div className="group flex flex-col relative w-full transition-all duration-500 bg-white rounded-xl sm:rounded-2xl overflow-hidden shadow-[0_2px_16px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)]">
      {/* Image Container — Square */}
      <div className="relative aspect-square w-full overflow-hidden bg-[#F4F4F2]">
        {/* Wishlist Heart */}
        <button
          onClick={handleToggleWishlist}
          className="absolute top-2 right-2 sm:top-3 sm:right-3 z-10 p-1.5 sm:p-2 bg-white/80 backdrop-blur-md hover:bg-white rounded-full text-charcoal hover:text-[#C9A84C] hover:scale-110 active:scale-95 transition-all duration-300 shadow-sm"
          aria-label={isWishlisted ? "Favorilerden Çıkar" : "Favorilere Ekle"}
        >
          {mounted && isWishlisted ? (
            <FaHeart className="text-[#C9A84C] w-3 h-3 sm:w-3.5 sm:h-3.5" />
          ) : (
            <FiHeart className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          )}
        </button>

        {/* Badges */}
        <div className="absolute top-2 left-2 sm:top-3 sm:left-3 z-10 flex flex-col gap-1 pointer-events-none select-none">
          {product.isNew && (
            <span className="bg-charcoal text-cream-light text-[6px] sm:text-[7px] font-semibold tracking-[0.15em] uppercase py-0.5 px-2 sm:py-1 sm:px-2.5 rounded-full shadow-sm">
              YENİ
            </span>
          )}
          {product.stock === 0 && (
            <span className="bg-[#B8960C] text-charcoal text-[6px] sm:text-[7px] font-bold tracking-[0.15em] uppercase py-0.5 px-2 sm:py-1 sm:px-2.5 rounded-full shadow-sm">
              TÜKENDİ
            </span>
          )}
        </div>

        {/* Image Link */}
        <Link
          href={`/shop/${product.slug}`}
          className="absolute inset-0 flex items-center justify-center cursor-pointer"
        >
          {hasImage ? (
            <Image
              src={displayImage}
              alt={`${product.brand} - ${product.perfumeName}`}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              quality={95}
              className="object-cover object-center"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[#F4F4F2]">
              <div className="relative w-3/5 h-3/5 opacity-30">
                <Image
                  src="/logo.png"
                  alt="Dekant Logo"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
          )}
        </Link>
      </div>

      {/* Content Area */}
      <div className="p-3 sm:p-4 flex flex-col gap-2 sm:gap-2.5 flex-1">
        {/* Brand + Gender */}
        <div className="flex items-center justify-between">
          <span className="font-montserrat text-[7px] sm:text-[8px] tracking-[0.15em] sm:tracking-[0.2em] text-[#C9A84C] uppercase font-bold">
            {product.brand}
          </span>
          <span className="font-montserrat text-[7px] sm:text-[8px] tracking-[0.1em] sm:tracking-[0.15em] text-charcoal/35 uppercase">
            {genderLabel}
          </span>
        </div>

        {/* Perfume Name */}
        <Link href={`/shop/${product.slug}`} className="block">
          <h3 className="font-playfair text-[12px] sm:text-[14px] font-medium text-charcoal tracking-wide line-clamp-1 group-hover:text-[#C9A84C] transition-colors duration-300">
            {product.perfumeName}
          </h3>
        </Link>

        {/* Size Selector */}
        <div className="flex items-center gap-1">
          {SIZE_OPTIONS.map((size) => {
            const price = product.prices[size];
            if (!price || price === 0) return null;
            return (
              <button
                key={size}
                onClick={(e) => handleSizeClick(e, size)}
                className={`flex-1 py-1 sm:py-1.5 rounded-md sm:rounded-lg text-center transition-all duration-300 font-montserrat text-[9px] sm:text-[10px] tracking-wider font-medium border ${
                  selectedSize === size
                    ? "bg-[#0D0D0D] text-[#F8F3E8] border-[#0D0D0D]"
                    : "bg-transparent text-charcoal/60 border-charcoal/12 hover:border-[#C9A84C]/40 hover:text-charcoal"
                }`}
              >
                {size}
              </button>
            );
          })}
        </div>

        {/* Price + Add to Cart */}
        <div className="flex items-center justify-between gap-1.5 sm:gap-2 mt-auto pt-1">
          <div className="flex flex-col">
            <span className="font-montserrat text-[15px] sm:text-[17px] font-bold tracking-wide text-charcoal">
              ₺{currentPrice}
            </span>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className={`flex items-center gap-1 sm:gap-1.5 px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-md sm:rounded-lg font-montserrat text-[8px] sm:text-[9px] tracking-[0.1em] sm:tracking-[0.15em] uppercase font-semibold transition-all duration-300 ${
              product.stock === 0
                ? "bg-charcoal/10 text-charcoal/30 cursor-not-allowed"
                : isAdding
                ? "bg-[#C9A84C] text-white scale-95"
                : "bg-[#0D0D0D] text-[#F8F3E8] hover:bg-[#C9A84C] hover:text-[#0D0D0D] active:scale-95"
            }`}
          >
            <FiShoppingBag className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            {isAdding ? "Eklendi ✓" : product.stock === 0 ? "Tükendi" : "Ekle"}
          </button>
        </div>
      </div>
    </div>
  );
}
