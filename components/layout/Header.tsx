"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSelector, useDispatch } from "react-redux";
import { selectCartItemCount } from "@/store/slices/cartSlice";
import { selectWishlistCount } from "@/store/slices/wishlistSlice";
import { openCart, openLoginModal } from "@/store/slices/uiSlice";
import { useAuth } from "@/hooks/useAuth";
import { signOut } from "@/lib/firebase/auth";
import { FiHeart, FiShoppingBag, FiUser, FiMenu, FiX, FiLogOut } from "react-icons/fi";
import Image from "next/image";

export default function Header() {
  const dispatch = useDispatch();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const cartCount = useSelector(selectCartItemCount);
  const wishlistCount = useSelector(selectWishlistCount);
  const { isAuthenticated } = useAuth();

  // Defer client-state-dependent rendering to avoid hydration mismatch
  useEffect(() => { setMounted(true); }, []);

  const navLinks = [
    { href: "/", label: "Ana Sayfa" },
    { href: "/shop", label: "Mağaza" },
    { href: "/about", label: "Hakkımızda" },
    { href: "/contact", label: "İletişim" },
  ];



  return (
    <>
      <header className="fixed top-0 left-0 w-full z-50 bg-white/90 border-b border-[#C9A84C]/20 text-charcoal backdrop-blur-xl shadow-sm transition-all duration-500">
        <div className="max-w-[1440px] mx-auto px-3 sm:px-8 h-16 sm:h-20 lg:h-24 flex items-center justify-between relative">
          
          {/* Left: Logo & Brand Name */}
          <div className="flex-1 flex items-center justify-start">
            <Link 
              href="/" 
              className="flex items-center gap-3 sm:gap-4 group focus:outline-none"
            >
              <div className="relative w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 overflow-hidden rounded-full border border-[#C9A84C]/40 group-hover:border-[#C9A84C] transition-all duration-700 shadow-[0_0_15px_rgba(201,168,76,0.1)] group-hover:shadow-[0_0_25px_rgba(201,168,76,0.25)] flex items-center justify-center bg-white shrink-0">
                 <div className="absolute inset-1 border border-[#C9A84C]/20 rounded-full transition-transform duration-700 group-hover:scale-105" />
                 <Image 
                   src="/logo.png" 
                   alt="Real Dekant Logo" 
                   fill 
                   className="object-cover transition-transform duration-1000 group-hover:scale-110 p-0.5"
                   priority
                 />
              </div>
              <div className="flex flex-col items-start justify-center">
                <span className="font-playfair text-[18px] sm:text-[22px] lg:text-[26px] font-bold tracking-[0.2em] text-[#C9A84C] uppercase leading-none group-hover:text-[#8B6914] transition-colors duration-500 whitespace-nowrap">
                  REAL DEKANT
                </span>
                <span className="font-montserrat text-[8px] sm:text-[9px] lg:text-[10px] tracking-[0.4em] text-charcoal/60 uppercase mt-1 lg:mt-1.5 group-hover:text-charcoal transition-colors duration-500 ml-0.5 whitespace-nowrap">
                  PERFUME
                </span>
              </div>
            </Link>
          </div>

          {/* Center: Nav links (Desktop) */}
          <nav className="hidden lg:flex flex-1 items-center justify-center space-x-10 rtl:space-x-reverse">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group relative font-montserrat text-[11px] tracking-[0.25em] uppercase text-charcoal/80 hover:text-[#C9A84C] transition-colors duration-300 py-2"
              >
                {link.label}
                <span className="absolute bottom-0 left-1/2 w-0 h-[1px] bg-[#C9A84C] group-hover:w-full group-hover:left-0 transition-all duration-500 ease-out" />
              </Link>
            ))}
          </nav>

          {/* Right: Actions */}
          <div className="flex-1 flex items-center justify-end space-x-1 sm:space-x-4 lg:space-x-6 rtl:space-x-reverse">
            
            {/* Wishlist */}
            <Link
              href="/account/favorites"
              onClick={(e) => {
                if (!isAuthenticated) {
                  e.preventDefault();
                  dispatch(openLoginModal());
                }
              }}
              className="hidden sm:block relative text-charcoal/80 hover:text-[#C9A84C] transition-colors duration-300 p-2 group"
              aria-label="Wishlist"
            >
              <FiHeart className="w-5 h-5 sm:w-[22px] sm:h-[22px] group-hover:scale-110 transition-transform duration-300" strokeWidth={1.5} />
              {mounted && wishlistCount > 0 && (
                <span className="absolute top-0 right-0 bg-[#8B6914] text-white text-[9px] font-montserrat font-bold w-[18px] h-[18px] rounded-full flex items-center justify-center shadow-sm border border-white">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* User Profile */}
            <Link
              href="/account"
              onClick={(e) => {
                if (!isAuthenticated) {
                  e.preventDefault();
                  dispatch(openLoginModal());
                }
              }}
              className="hidden sm:block text-charcoal/80 hover:text-[#C9A84C] transition-colors duration-300 p-2 group"
              aria-label="Account"
            >
              <FiUser className="w-5 h-5 sm:w-[22px] sm:h-[22px] group-hover:scale-110 transition-transform duration-300" strokeWidth={1.5} />
            </Link>

            {/* Cart */}
            <button
              onClick={() => dispatch(openCart())}
              className="relative text-charcoal/80 hover:text-[#C9A84C] transition-colors duration-300 p-2 group focus:outline-none bg-transparent"
              aria-label="Cart"
            >
              <FiShoppingBag className="w-5 h-5 sm:w-[22px] sm:h-[22px] group-hover:scale-110 transition-transform duration-300" strokeWidth={1.5} />
              {mounted && cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-[#C9A84C] text-black text-[9px] font-montserrat font-bold w-[18px] h-[18px] rounded-full flex items-center justify-center shadow-sm border border-white">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Button (Right on Mobile) */}
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="lg:hidden text-charcoal/80 hover:text-[#C9A84C] transition-colors duration-300 p-1 ml-1 focus:outline-none bg-transparent"
              aria-label="Open Menu"
            >
              <FiMenu size={24} />
            </button>

          </div>
        </div>
      </header>

      {/* Spacer to push page content down */}
      <div className="h-16 sm:h-20 lg:h-24" />

      {/* Mobile Drawer (Slide-in) */}
      <div
        className={`fixed inset-0 z-[100] transition-opacity duration-300 ${
          isDrawerOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Backdrop */}
        <div
          onClick={() => setIsDrawerOpen(false)}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Drawer Panel */}
        <div
          className={`absolute top-0 right-0 rtl:left-0 rtl:right-auto w-[85%] max-w-sm h-full bg-[#fdfbf7] border-l rtl:border-r rtl:border-l-0 border-[#C9A84C]/20 p-6 flex flex-col justify-between shadow-2xl transition-transform duration-300 ease-in-out overflow-y-auto ${
            isDrawerOpen
              ? "translate-x-0"
              : "translate-x-full rtl:-translate-x-full"
          }`}
        >
          <div>
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-6 border-b border-[#C9A84C]/10">
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 overflow-hidden rounded-full border border-[#C9A84C]/40 bg-white flex items-center justify-center">
                  <Image src="/logo.png" alt="Real Dekant" fill className="object-cover p-0.5" />
                </div>
                <div className="flex flex-col">
                  <span className="font-playfair text-lg font-bold tracking-widest text-[#C9A84C] uppercase">
                    REAL DEKANT
                  </span>
                  <span className="font-montserrat text-[8px] tracking-[0.3em] text-charcoal/70 uppercase">
                    PERFUME
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="text-charcoal/85 hover:text-[#C9A84C] transition-colors focus:outline-none bg-transparent"
                aria-label="Close Menu"
              >
                <FiX size={20} />
              </button>
            </div>

            {/* Drawer Links */}
            <nav className="flex flex-col space-y-5 mt-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsDrawerOpen(false)}
                  className="font-montserrat text-xs tracking-[0.2em] uppercase text-charcoal/85 hover:text-[#C9A84C] transition-colors py-1 flex items-center justify-between group"
                >
                  <span>{link.label}</span>
                  <span className="w-1.5 h-1.5 bg-[#C9A84C]/40 group-hover:bg-[#C9A84C] transition-all rotate-45" />
                </Link>
              ))}

              <div className="border-t border-[#C9A84C]/10 my-4" />

              <span className="font-montserrat text-[9px] tracking-[0.3em] uppercase text-charcoal/40 font-bold block mb-1">
                Kişisel Bölüm
              </span>

              <Link
                href="/account"
                onClick={(e) => {
                  if (!isAuthenticated) {
                    e.preventDefault();
                    setIsDrawerOpen(false);
                    dispatch(openLoginModal());
                  } else {
                    setIsDrawerOpen(false);
                  }
                }}
                className="flex items-center justify-between text-charcoal/85 hover:text-[#C9A84C] py-2 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <FiUser className="w-[18px] h-[18px] text-[#C9A84C]" />
                  <span className="font-montserrat text-[11px] tracking-widest uppercase font-semibold">
                    {mounted && isAuthenticated ? "Hesabım" : "Giriş Yap / Üye Ol"}
                  </span>
                </div>
                {mounted && isAuthenticated && (
                  <span className="text-[10px] font-montserrat text-[#C9A84C] uppercase tracking-wider font-bold">Yönet</span>
                )}
              </Link>

              <Link
                href="/account/favorites"
                onClick={(e) => {
                  if (!isAuthenticated) {
                    e.preventDefault();
                    setIsDrawerOpen(false);
                    dispatch(openLoginModal());
                  } else {
                    setIsDrawerOpen(false);
                  }
                }}
                className="flex items-center justify-between text-charcoal/85 hover:text-[#C9A84C] py-2 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <FiHeart className="w-[18px] h-[18px] text-[#C9A84C]" />
                  <span className="font-montserrat text-[11px] tracking-widest uppercase font-semibold">Favorilerim</span>
                </div>
                {mounted && wishlistCount > 0 && (
                  <span className="bg-[#8B6914] text-white text-[9px] font-montserrat font-bold px-2 py-0.5 rounded-full shadow-sm">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              <button
                onClick={() => {
                  setIsDrawerOpen(false);
                  dispatch(openCart());
                }}
                className="flex items-center justify-between text-charcoal/85 hover:text-[#C9A84C] py-2 transition-colors w-full text-left bg-transparent focus:outline-none"
              >
                <div className="flex items-center gap-3">
                  <FiShoppingBag className="w-[18px] h-[18px] text-[#C9A84C]" />
                  <span className="font-montserrat text-[11px] tracking-widest uppercase font-semibold">Sepetim</span>
                </div>
                {mounted && cartCount > 0 && (
                  <span className="bg-[#C9A84C] text-black text-[9px] font-montserrat font-bold px-2 py-0.5 rounded-full shadow-sm">
                    {cartCount}
                  </span>
                )}
              </button>
            </nav>
          </div>

          {/* Drawer Footer */}
          <div className="pt-6 border-t border-[#C9A84C]/10 flex flex-col space-y-4" style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}>
            {mounted && isAuthenticated && (
              <button
                onClick={async () => {
                  setIsDrawerOpen(false);
                  await signOut();
                }}
                className="flex items-center justify-center gap-2 w-full py-2.5 border border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-lg text-xs font-montserrat tracking-widest uppercase font-bold transition-all focus:outline-none"
              >
                <FiLogOut size={14} />
                Çıkış Yap
              </button>
            )}
            <span className="font-dancing text-center text-[#C9A84C] text-sm">
              Görünmez Ama Unutulmaz
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
