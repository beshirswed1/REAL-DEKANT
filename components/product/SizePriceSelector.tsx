"use client";

import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useCart } from "@/hooks/useCart";
import { toggleWishlist } from "@/store/slices/wishlistSlice";
import type { RootState } from "@/store";
import { FiHeart, FiShoppingBag } from "react-icons/fi";
import { FaHeart } from "react-icons/fa";
import type { Product, PriceSize } from "@/types";

import { getOptimizedImage } from "@/lib/imgbb/config";

interface SizePriceSelectorProps {
  product: Product;
}

export default function SizePriceSelector({ product }: SizePriceSelectorProps) {
  const dispatch = useDispatch();
  const [selectedSize, setSelectedSize] = useState<PriceSize>("3ml");
  const [added, setAdded] = useState(false);
  const isWishlisted = useSelector((state: RootState) =>
    state.wishlist.items.some((i) => i.productId === product.id)
  );
  const { addItem } = useCart();

  const currentPrice = product.prices[selectedSize];
  const displayImage = getOptimizedImage(product.images?.[0], "card");

  const handleAddToCart = () => {
    addItem({
      id: `${product.id}_${selectedSize}`,
      productId: product.id,
      sku: product.sku || `SKU-${product.id}`,
      perfumeName: product.perfumeName,
      brand: product.brand,
      size: selectedSize,
      price: currentPrice,
      qty: 1,
      image: displayImage,
      slug: product.slug,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  const handleToggleWishlist = () => {
    const lowestPrice = Math.min(
      product.prices["3ml"] || 9999,
      product.prices["5ml"] || 9999,
      product.prices["10ml"] || 9999
    );

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

  return (
    <div className="space-y-6">
      
      {/* Active Price Display */}
      <div className="border-b border-[#C9A84C]/15 pb-4">
        <span className="font-montserrat text-2xl font-bold tracking-wider text-charcoal">
          ₺{currentPrice}
        </span>
        <span className="text-xs font-montserrat text-charcoal/50 block mt-1 tracking-wide">
          Seçilen boyuta göre fiyat güncellenmiştir.
        </span>
      </div>

      {/* Size Selector Grid */}
      <div className="space-y-3">
        <label className="font-montserrat text-[10px] tracking-widest text-charcoal/50 uppercase block font-semibold">
          Boyut Seçiniz:
        </label>
        <div className="grid grid-cols-3 gap-3">
          {(["3ml", "5ml", "10ml"] as const).map((size) => {
            const price = product.prices[size];
            if (!price) return null;
            return (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                aria-pressed={selectedSize === size}
                aria-label={`${size} boyutu seç, fiyat ${price} Türk Lirası`}
                className={`py-3.5 px-2 border transition-colors duration-100 flex items-center justify-center ${
                  selectedSize === size
                    ? "border-[#C9A84C] bg-white text-charcoal ring-1 ring-[#C9A84C]"
                    : "border-charcoal/15 bg-white text-charcoal hover:border-[#C9A84C]/50"
                }`}
              >
                <span className="font-montserrat text-xs tracking-wider uppercase font-semibold">
                  {size}—{price}₺
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-4 rtl:space-x-reverse pt-2">
        <button
          onClick={handleAddToCart}
          aria-label={added ? "Sepete Eklendi" : `${product.brand} - ${product.perfumeName} sepete ekle`}
          className={`flex-grow font-montserrat text-xs tracking-[0.25em] uppercase font-bold py-4 px-6 transition-all duration-300 flex items-center justify-center space-x-2 rtl:space-x-reverse ${
            added ? "bg-green-700 text-white" : "bg-[#C9A84C] hover:bg-[#B8960C] text-black"
          }`}
        >
          {added ? (
            <>
              <span>✓</span>
              <span>Eklendi!</span>
            </>
          ) : (
            <>
              <FiShoppingBag size={16} />
              <span>Sepete Ekle</span>
            </>
          )}
        </button>

        <button
          onClick={handleToggleWishlist}
          className={`px-5 py-4 border transition-colors duration-300 flex items-center justify-center ${
            isWishlisted
              ? "border-[#C9A84C] bg-cream text-[#8B6914]"
              : "border-charcoal/15 bg-white text-charcoal hover:border-[#C9A84C]"
          }`}
          aria-label={isWishlisted ? "Favorilerden Çıkar" : "Favorilere Ekle"}
        >
          {isWishlisted ? <FaHeart size={18} /> : <FiHeart size={18} />}
        </button>
      </div>

    </div>
  );
}
