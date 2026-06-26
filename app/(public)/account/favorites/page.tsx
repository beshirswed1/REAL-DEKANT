"use client";

import { useAppSelector, useAppDispatch } from "@/store";
import { selectWishlistItems, removeFromWishlist } from "@/store/slices/wishlistSlice";
import { addToCart } from "@/store/slices/cartSlice";
import { openCart } from "@/store/slices/uiSlice";
import { FiHeart, FiTrash2, FiShoppingCart } from "react-icons/fi";
import Image from "next/image";
import Link from "next/link";
import { doc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useAuth } from "@/hooks/useAuth";

export default function FavoritesPage() {
  const items = useAppSelector(selectWishlistItems);
  const dispatch = useAppDispatch();
  const { user } = useAuth();

  const handleRemove = async (productId: string) => {
    // Optimistic UI update
    dispatch(removeFromWishlist(productId));
    
    // Also remove from firestore
    if (user) {
      try {
        await deleteDoc(doc(db, `users/${user.uid}/wishlist`, productId));
      } catch (error) {
        console.error("Error removing from wishlist", error);
      }
    }
  };

  const handleAddToCart = (item: { productId: string; perfumeName: string; brand: string; image: string; price: number; slug: string }) => {
    // Assuming default 3ml size for quick add, or whatever is passed.
    // The cart item needs size. Since wishlist has a price but maybe not size, we can default.
    // Let's check what wishlist items have. 
    // They have: productId, perfumeName, brand, image, price, slug.
    dispatch(
      addToCart({
        id: `${item.productId}-3ml`,
        productId: item.productId,
        sku: item.productId,
        perfumeName: item.perfumeName,
        brand: item.brand,
        image: item.image,
        size: "3ml",
        price: item.price,
        qty: 1,
        slug: item.slug,
      })
    );
    dispatch(openCart());
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 sm:py-24 px-2 sm:px-4 text-center animate-in fade-in duration-700">
        <div className="relative w-20 h-20 sm:w-28 sm:h-28 mb-6 sm:mb-8 flex items-center justify-center">
          <div className="absolute inset-0 bg-[#C9A84C]/5 rounded-full animate-ping opacity-30"></div>
          <div className="absolute inset-4 bg-[#C9A84C]/10 rounded-full animate-pulse opacity-50"></div>
          <FiHeart className="text-[#C9A84C] w-8 h-8 sm:w-12 sm:h-12 relative z-10 drop-shadow-sm" />
        </div>
        <h2 className="text-xl sm:text-3xl font-playfair font-bold text-charcoal mb-3 sm:mb-4">Favori Listeniz Boş</h2>
        <p className="text-charcoal/60 font-montserrat text-xs sm:text-sm max-w-sm sm:max-w-md mb-6 sm:mb-10 leading-relaxed px-4">
          Koleksiyonumuzdaki eşsiz kokuları keşfedin ve kendi imza koleksiyonunuzu oluşturmaya başlayın.
        </p>
        <Link 
          href="/shop"
          className="group relative inline-flex items-center justify-center bg-charcoal text-white font-montserrat text-[10px] sm:text-xs tracking-[0.2em] sm:tracking-[0.25em] uppercase py-3 sm:py-4 px-8 sm:px-12 overflow-hidden transition-all duration-500 shadow-[0_5px_15px_rgba(0,0,0,0.1)] hover:shadow-[0_5px_25px_rgba(201,168,76,0.3)] hover:border-[#C9A84C] border border-transparent"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#C9A84C] to-[#8B6914] translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out"></div>
          <span className="relative z-10 transition-colors duration-500 group-hover:text-black font-semibold">Koleksiyonu İncele</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="border-b border-[#C9A84C]/20 pb-4">
        <h2 className="text-3xl font-playfair font-bold text-charcoal mb-2 tracking-wide">Favorilerim</h2>
        <p className="text-xs font-montserrat tracking-widest text-[#C9A84C] uppercase">
          İmza Kokularınız ({items.length} Ürün)
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
        {items.map((item) => (
          <div key={item.productId} className="group flex flex-col bg-[#fdfbf7] border border-[#C9A84C]/20 hover:border-[#C9A84C]/60 transition-all duration-500 hover:shadow-[0_10px_40px_rgba(201,168,76,0.15)] relative">
            
            {/* Action Buttons */}
            <div className="absolute top-2 right-2 sm:top-3 sm:right-3 z-20 flex flex-col gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300 translate-x-0 sm:translate-x-2 sm:group-hover:translate-x-0">
              <button
                onClick={() => handleRemove(item.productId)}
                className="p-2 bg-white/90 backdrop-blur-md rounded-full text-charcoal hover:text-red-500 hover:bg-white transition-all shadow-md"
                aria-label="Favorilerden Kaldır"
              >
                <FiTrash2 size={14} />
              </button>
            </div>

            {/* Image Container */}
            <Link href={`/shop/${item.slug}`} className="relative aspect-[4/5] w-full bg-cream-light overflow-hidden">
              {item.image ? (
                <Image
                  src={item.image}
                  alt={item.perfumeName}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-cream-dark/20 text-charcoal/40 font-montserrat text-[10px] tracking-widest uppercase">
                  Görsel Yok
                </div>
              )}
              {/* Subtle Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </Link>

            {/* Content Container */}
            <div className="p-3 sm:p-5 flex flex-col flex-grow bg-white z-10 transition-transform duration-500 group-hover:-translate-y-2">
              <span className="text-[9px] sm:text-[10px] font-montserrat tracking-[0.2em] sm:tracking-[0.25em] text-[#C9A84C] uppercase font-bold mb-1.5 sm:mb-2">
                {item.brand}
              </span>
              <Link href={`/shop/${item.slug}`} className="font-playfair text-sm sm:text-lg font-bold text-charcoal mb-2 sm:mb-3 group-hover:text-[#8B6914] transition-colors line-clamp-2 leading-tight">
                {item.perfumeName}
              </Link>
              
              <div className="mt-auto pt-3 sm:pt-4 flex items-center justify-between border-t border-[#C9A84C]/10">
                <div className="flex flex-col">
                  <span className="font-montserrat text-[9px] sm:text-xs text-charcoal/50 mb-0.5 hidden sm:block">Başlangıç Fiyatı</span>
                  <span className="font-montserrat text-xs sm:text-[15px] font-bold text-charcoal leading-none">
                    ₺{item.price.toLocaleString("tr-TR")}
                  </span>
                </div>
                <button
                  onClick={() => handleAddToCart(item)}
                  className="p-2 sm:p-3 bg-charcoal text-[#C9A84C] hover:bg-[#C9A84C] hover:text-black transition-all duration-300 shadow-sm"
                  aria-label="Sepete Ekle"
                >
                  <FiShoppingCart size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
