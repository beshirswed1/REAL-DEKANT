"use client";

import React, { useState, useEffect } from "react";

import Link from "next/link";
import { useSelector, useDispatch } from "react-redux";
import { selectIsCartOpen, closeCart } from "@/store/slices/uiSlice";
import { useCart } from "@/hooks/useCart";
import { FiX, FiMinus, FiPlus, FiTrash2, FiTag, FiShoppingBag, FiLock } from "react-icons/fi";
import Image from "next/image";
import { getOptimizedImage } from "@/lib/imgbb/config";

export default function CartSidebar() {
  const locale = "tr";
  const isOpen = useSelector(selectIsCartOpen);
  const dispatch = useDispatch();

  const {
    items,
    itemCount,
    subtotal,
    total,
    coupon,
    shippingFee,
    removeItem,
    updateItemQty,
    applyCoupon: applyCouponToStore,
    removeCoupon,
  } = useCart();

  const [couponCode, setCouponCode] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null);

  // Close the cart sidebar
  const handleClose = () => {
    dispatch(closeCart());
  };

  // Handle coupon validation
  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    setCouponLoading(true);
    setCouponError(null);
    setCouponSuccess(null);

    try {
      const res = await fetch("/api/validate-coupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: couponCode,
          cartItems: items,
          locale,
        }),
      });

      const data = await res.json();

      if (data.valid) {
        applyCouponToStore({
          code: couponCode.trim().toUpperCase(),
          type: data.type,
          value: data.value,
          productIds: data.productIds,
        });
        setCouponSuccess(data.message || "Kupon başarıyla uygulandı!");
        setCouponCode("");
      } else {
        setCouponError(data.message || "Geçersiz veya süresi dolmuş kupon.");
      }
    } catch {
      setCouponError("Geçersiz veya süresi dolmuş kupon.");
    } finally {
      setCouponLoading(false);
    }
  };

  // Background coupon re-validation when cart opens
  useEffect(() => {
    if (isOpen && coupon) {
      let isMounted = true;
      fetch("/api/validate-coupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: coupon.code,
          cartItems: items,
          locale,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (isMounted && !data.valid) {
            removeCoupon();
            setCouponError(data.message || "Kupon süresi doldu veya deaktif edildi.");
            setCouponSuccess(null);
          }
        })
        .catch(() => {
          // Ignore background validation errors to avoid disturbing the user
        });

      return () => {
        isMounted = false;
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, coupon?.code]);

  const handleRemoveCoupon = () => {
    removeCoupon();
    setCouponSuccess(null);
    setCouponError(null);
  };

  const finalDiscount = Math.max(0, subtotal - total + shippingFee);


  return (
    <>
      {/* Backdrop */}
      <div
        onClick={handleClose}
        className={`fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm transition-opacity duration-500 ease-in-out ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Cart Sidebar Panel */}
      <div
        className={`fixed top-0 right-0 rtl:left-0 rtl:right-auto w-full sm:w-[450px] h-full bg-[#fdfbf7] border-l rtl:border-r rtl:border-l-0 border-[#C9A84C]/30 shadow-[0_0_40px_rgba(0,0,0,0.15)] z-[101] flex flex-col transition-transform duration-500 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full rtl:-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#C9A84C]/20 flex items-center justify-between bg-white/50 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <span className="font-playfair text-[22px] font-bold tracking-widest text-charcoal uppercase">
              SEPETİM
            </span>
            {itemCount > 0 && (
              <span className="bg-[#C9A84C] text-black font-montserrat text-[10px] px-2 py-0.5 rounded-sm font-bold shadow-sm">
                {itemCount} ÜRÜN
              </span>
            )}
          </div>
          <button
            onClick={handleClose}
            className="text-charcoal/60 hover:text-black hover:bg-[#C9A84C]/20 transition-all focus:outline-none p-2.5 rounded-full hover:rotate-90 duration-300"
            aria-label="Close Cart"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-grow overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-[#C9A84C]/30">
          {items.length === 0 ? (
            /* Empty State */
            <div className="h-full flex flex-col items-center justify-center text-center px-4 py-20">
              <div className="relative w-24 h-24 mb-6 flex items-center justify-center">
                <div className="absolute inset-0 bg-[#C9A84C]/10 rounded-full animate-ping opacity-20"></div>
                <div className="absolute inset-2 bg-[#C9A84C]/20 rounded-full animate-pulse opacity-40"></div>
                <FiShoppingBag size={40} className="text-[#C9A84C] relative z-10 drop-shadow-md" />
              </div>
              <h3 className="font-playfair text-2xl font-bold text-charcoal mb-2">Sepetiniz Boş</h3>
              <p className="font-montserrat text-xs text-charcoal/60 mb-8 leading-relaxed max-w-[250px]">
                İmza kokunuzu bulmak için koleksiyonumuzu keşfedin ve duyularınızı şımartın.
              </p>
              <Link
                href="/shop"
                onClick={handleClose}
                className="group relative inline-flex items-center justify-center bg-charcoal text-white font-montserrat text-[11px] tracking-[0.25em] uppercase py-4 px-10 overflow-hidden transition-all duration-500 hover:shadow-[0_0_20px_rgba(201,168,76,0.3)] hover:border-[#C9A84C] border border-transparent"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#C9A84C] to-[#8B6914] translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out"></div>
                <span className="relative z-10 transition-colors duration-500 group-hover:text-black font-semibold">Koleksiyonu Keşfet</span>
              </Link>
            </div>
          ) : (
            /* Cart Items List */
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="group relative bg-white/60 backdrop-blur-md border border-[#C9A84C]/20 p-4 flex space-x-5 rtl:space-x-reverse transition-all duration-500 hover:border-[#C9A84C]/60 hover:shadow-[0_8px_30px_rgba(201,168,76,0.15)] hover:bg-white"
                >
                  {/* Item Image */}
                  <div className="relative w-24 h-24 bg-cream-dark/10 flex-shrink-0 border border-[#C9A84C]/15 overflow-hidden rounded-sm shadow-inner group-hover:shadow-[0_0_15px_rgba(201,168,76,0.2)] transition-shadow duration-500">
                    <Image
                      src={getOptimizedImage(item.image, "thumb")}
                      alt={item.perfumeName}
                      fill
                      sizes="96px"
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  </div>

                  {/* Item Details */}
                  <div className="flex-grow flex flex-col justify-between py-1">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <span className="font-montserrat text-[9px] tracking-[0.2em] text-[#C9A84C] uppercase font-bold mb-1 block">
                            {item.brand}
                          </span>
                          <h4 className="font-playfair text-[15px] font-bold text-charcoal leading-tight group-hover:text-[#8B6914] transition-colors duration-300">
                            {item.perfumeName}
                          </h4>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-charcoal/40 hover:text-red-500 transition-all p-2 rounded-full hover:bg-red-50"
                          aria-label="Remove item"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </div>

                      {/* Size Badge */}
                      <div className="mt-2 flex items-center space-x-2 rtl:space-x-reverse">
                        <span className="bg-charcoal text-white font-montserrat text-[9px] tracking-widest uppercase font-semibold px-2.5 py-1 rounded-xs">
                          {item.size}
                        </span>
                      </div>
                    </div>

                    {/* Price and Stepper */}
                    <div className="flex justify-between items-end mt-3">
                      {/* Qty Stepper */}
                      <div className="flex items-center border border-[#C9A84C]/40 bg-white rounded-full shadow-sm overflow-hidden h-9">
                        <button
                          onClick={() => updateItemQty(item.id, item.qty - 1)}
                          className="px-3.5 h-full flex items-center justify-center text-charcoal/70 hover:text-charcoal hover:bg-[#C9A84C]/15 transition-colors focus:outline-none"
                          aria-label="Decrease quantity"
                        >
                          <FiMinus size={16} />
                        </button>
                        <span className="w-8 text-center font-montserrat text-sm font-semibold text-charcoal">
                          {item.qty}
                        </span>
                        <button
                          onClick={() => updateItemQty(item.id, item.qty + 1)}
                          className="px-3.5 h-full flex items-center justify-center text-charcoal/70 hover:text-charcoal hover:bg-[#C9A84C]/15 transition-colors focus:outline-none"
                          aria-label="Increase quantity"
                        >
                          <FiPlus size={16} />
                        </button>
                      </div>

                      {/* Total Price */}
                      <div className="text-right flex flex-col items-end">
                        <span className="font-montserrat text-base font-bold text-charcoal leading-none tracking-wide">
                          ₺{(item.price * item.qty).toLocaleString("tr-TR")}
                        </span>
                        {item.qty > 1 && (
                           <span className="font-montserrat text-[10px] text-charcoal/40 mt-1">
                             ₺{item.price.toLocaleString("tr-TR")} / adet
                           </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer / Summary (only shown if there are items) */}
        {items.length > 0 && (
          <div className="border-t border-[#C9A84C]/20 p-6 bg-cream-light/60 backdrop-blur-sm space-y-4">
            {/* Coupon Form */}
            {!coupon ? (
              <form onSubmit={handleApplyCoupon} className="flex group shadow-sm rounded-lg overflow-hidden">
                <div className="relative flex-grow">
                  <span className="absolute left-4 rtl:right-4 rtl:left-auto top-1/2 -translate-y-1/2 text-[#C9A84C]">
                    <FiTag size={18} />
                  </span>
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Kupon Kodu Girin"
                    className="w-full bg-white border-y border-l rtl:border-l-0 rtl:border-r border-[#C9A84C]/30 text-sm font-montserrat pl-11 pr-4 py-3.5 rtl:pr-11 rtl:pl-4 outline-none focus:border-[#C9A84C] focus:bg-[#fdfbf7] transition-all"
                  />
                </div>
                <button
                  type="submit"
                  disabled={couponLoading || !couponCode.trim()}
                  className="bg-charcoal hover:bg-[#C9A84C] hover:text-black text-white font-montserrat text-sm font-bold px-6 py-3.5 tracking-wider uppercase transition-all duration-300 disabled:opacity-50 disabled:hover:bg-charcoal disabled:hover:text-white border border-charcoal hover:border-[#C9A84C]"
                >
                  {couponLoading ? "..." : "Uygula"}
                </button>
              </form>
            ) : (
              <div className="bg-[#C9A84C]/10 border border-[#C9A84C]/25 p-3 flex items-center justify-between">
                <div className="flex items-center space-x-2 rtl:space-x-reverse text-[#8B6914]">
                  <FiTag size={14} />
                  <span className="font-montserrat text-xs font-bold tracking-wider">
                    {coupon.code}
                  </span>
                  <span className="text-[10px] font-montserrat">
                    ({coupon.type === "percentage" ? `${coupon.value}%` : coupon.type === "fixed" ? `${coupon.value}₺` : "Ücretsiz"})
                  </span>
                </div>
                <button
                  onClick={handleRemoveCoupon}
                  className="text-xs font-montserrat font-bold text-red-600 hover:text-red-800 transition-colors uppercase tracking-wider"
                >
                  Kaldır
                </button>
              </div>
            )}

            {/* Error / Success Alerts */}
            {couponError && (
              <p className="text-red-600 font-montserrat text-[11px] leading-tight mt-1">
                {couponError}
              </p>
            )}
            {couponSuccess && (
              <p className="text-green-700 font-montserrat text-[11px] leading-tight mt-1 font-semibold">
                {couponSuccess}
              </p>
            )}

            {/* Summary Details */}
            <div className="space-y-2.5 pt-2">
              {/* Subtotal */}
              <div className="flex justify-between text-xs font-montserrat text-charcoal/80">
                <span>Ara Toplam</span>
                <span>₺{subtotal}</span>
              </div>

              {/* Discount (if applicable) */}
              {finalDiscount > 0 && (
                <div className="flex justify-between text-xs font-montserrat text-green-700 font-medium">
                  <span>İndirim</span>
                  <span>-₺{finalDiscount}</span>
                </div>
              )}

              {/* Shipping Fee */}
              <div className="flex justify-between text-xs font-montserrat text-charcoal/80">
                <span>Kargo Ücreti</span>
                <span>{shippingFee === 0 ? "Ücretsiz" : `₺${shippingFee}`}</span>
              </div>

              {/* Divider */}
              <div className="border-t border-[#C9A84C]/15 my-2" />

              {/* Total */}
              <div className="flex justify-between items-baseline text-charcoal">
                <span className="font-playfair text-base font-bold">Toplam</span>
                <span className="font-montserrat text-xl font-bold tracking-wider text-[#C9A84C]">
                  ₺{total}
                </span>
              </div>
            </div>

            {/* Checkout CTA */}
            <Link
              href="/checkout"
              onClick={handleClose}
              className="group relative w-full flex items-center justify-center gap-3 bg-charcoal text-white font-montserrat text-sm font-bold py-4 px-6 tracking-[0.2em] uppercase overflow-hidden transition-all duration-500 shadow-lg hover:shadow-[0_8px_30px_rgba(201,168,76,0.4)] mt-4 rounded-lg"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#C9A84C] to-[#8B6914] translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out"></div>
              <FiLock size={18} className="relative z-10 transition-colors duration-500 group-hover:text-black" />
              <span className="relative z-10 transition-colors duration-500 group-hover:text-black">Güvenli Ödeme</span>
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
