"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import type { SiteConfig } from "@/components/admin/SettingsForm";

// ─── Footer ───────────────────────────────────────────────────────────────────
interface FooterProps {
  config?: SiteConfig | null;
}

export default function Footer({ config }: FooterProps) {
  const currentYear = new Date().getFullYear();

  // Defaults if config is missing
  const desc = config?.footerDescription || "Özenle seçilmiş, %100 orijinal marka parfümlerden hazırlanan lüks dekant (deneme boyu) koleksiyonu.";
  const motto = config?.siteMotto || "Görünmez Ama Unutulmaz";
  const email = config?.contactEmail || "info@realdekant.com";

  return (
    <>
      <footer className="bg-[#0D0D0D] text-[#F8F3E8] py-14 mt-auto border-t border-[#C9A84C]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
            {/* Column 1: Brand */}
            <div className="flex flex-col space-y-4">
              <Link href="/" className="flex items-center gap-3 group focus:outline-none">
                <div className="relative w-12 h-12 overflow-hidden rounded-full border border-[#C9A84C]/30 group-hover:border-[#C9A84C] transition-all duration-500 flex items-center justify-center bg-white shrink-0">
                  <Image 
                    src="/logo.png" 
                    alt="Real Dekant Logo" 
                    fill 
                    className="object-cover transition-transform duration-700 group-hover:scale-105 p-0.5"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="font-playfair text-lg font-bold tracking-[0.15em] text-[#C9A84C] uppercase leading-none group-hover:text-white transition-colors duration-300">
                    REAL DEKANT
                  </span>
                  <span className="font-montserrat text-[8px] tracking-[0.3em] text-[#F8F3E8]/40 uppercase mt-1 group-hover:text-[#F8F3E8]/60 transition-colors duration-300">
                    PERFUME
                  </span>
                </div>
              </Link>
              <p className="font-montserrat text-[11px] text-[#F8F3E8]/55 max-w-xs leading-relaxed">
                {desc}
              </p>
              <div className="pt-2">
                <span className="font-dancing text-xl text-[#C9A84C]/80 italic">
                  &ldquo;{motto}&rdquo;
                </span>
              </div>
            </div>

            {/* Column 2: Quick Links */}
            <div className="flex flex-col space-y-4">
              <h3 className="font-playfair text-sm font-semibold tracking-wider text-[#C9A84C] uppercase">
                Hızlı Bağlantılar
              </h3>
              <ul className="flex flex-col space-y-2.5">
                <li>
                  <Link
                    href="/"
                    className="font-montserrat text-[11px] text-[#F8F3E8]/60 hover:text-[#C9A84C] transition-colors duration-200 flex items-center gap-2"
                  >
                    <span className="w-1 h-1 rounded-full bg-[#C9A84C]/40" />
                    Ana Sayfa
                  </Link>
                </li>
                <li>
                  <Link
                    href="/shop"
                    className="font-montserrat text-[11px] text-[#F8F3E8]/60 hover:text-[#C9A84C] transition-colors duration-200 flex items-center gap-2"
                  >
                    <span className="w-1 h-1 rounded-full bg-[#C9A84C]/40" />
                    Mağaza
                  </Link>
                </li>
                <li>
                  <Link
                    href="/about"
                    className="font-montserrat text-[11px] text-[#F8F3E8]/60 hover:text-[#C9A84C] transition-colors duration-200 flex items-center gap-2"
                  >
                    <span className="w-1 h-1 rounded-full bg-[#C9A84C]/40" />
                    Hakkımızda
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="font-montserrat text-[11px] text-[#F8F3E8]/60 hover:text-[#C9A84C] transition-colors duration-200 flex items-center gap-2"
                  >
                    <span className="w-1 h-1 rounded-full bg-[#C9A84C]/40" />
                    İletişim
                  </Link>
                </li>
                <li>
                  <a
                    href="https://ikimedya.com/real-dekant/?utm_source=ig&utm_medium=social&utm_content=link_in_bio"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-montserrat text-[11px] text-[#F8F3E8]/60 hover:text-[#C9A84C] transition-colors duration-200 flex items-center gap-2"
                  >
                    <span className="w-1 h-1 rounded-full bg-[#C9A84C]/40" />
                    Katalog
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 3: Yasal */}
            <div className="flex flex-col space-y-4">
              <h3 className="font-playfair text-sm font-semibold tracking-wider text-[#C9A84C] uppercase">
                Yasal
              </h3>
              <ul className="flex flex-col space-y-2.5">
                <li>
                  <Link
                    href="/privacy"
                    className="font-montserrat text-[11px] text-[#F8F3E8]/60 hover:text-[#C9A84C] transition-colors duration-200 flex items-center gap-2"
                  >
                    <span className="w-1 h-1 rounded-full bg-[#C9A84C]/40" />
                    Gizlilik Politikası
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="font-montserrat text-[11px] text-[#F8F3E8]/60 hover:text-[#C9A84C] transition-colors duration-200 flex items-center gap-2"
                  >
                    <span className="w-1 h-1 rounded-full bg-[#C9A84C]/40" />
                    Kullanım Şartları
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 4: Social & Contact */}
            <div className="flex flex-col space-y-4">
              <h3 className="font-playfair text-sm font-semibold tracking-wider text-[#C9A84C] uppercase">
                İletişim
              </h3>
              <div className="flex flex-wrap gap-4">
                {/* Instagram */}
                {config?.contactInstagram && (
                  <a
                    href={`https://www.instagram.com/${config.contactInstagram.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 flex items-center justify-center rounded-full border border-[#C9A84C]/20 text-[#F8F3E8]/60 hover:text-[#C9A84C] hover:border-[#C9A84C]/60 transition-all duration-300"
                    aria-label="Instagram"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                    </svg>
                  </a>
                )}
                
                {/* TikTok */}
                {config?.contactTikTok && (
                  <a
                    href={`https://www.tiktok.com/@${config.contactTikTok.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 flex items-center justify-center rounded-full border border-[#C9A84C]/20 text-[#F8F3E8]/60 hover:text-[#FE2C55] hover:border-[#FE2C55]/60 transition-all duration-300"
                    aria-label="TikTok"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5v3a8 8 0 0 1-5-3Z" />
                    </svg>
                  </a>
                )}

                {/* Twitter / X */}
                {config?.contactTwitter && (
                  <a
                    href={`https://twitter.com/${config.contactTwitter.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 flex items-center justify-center rounded-full border border-[#C9A84C]/20 text-[#F8F3E8]/60 hover:text-[#1DA1F2] hover:border-[#1DA1F2]/60 transition-all duration-300"
                    aria-label="Twitter"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                    </svg>
                  </a>
                )}

                {/* Facebook */}
                {config?.contactFacebook && (
                  <a
                    href={`https://www.facebook.com/${config.contactFacebook}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 flex items-center justify-center rounded-full border border-[#C9A84C]/20 text-[#F8F3E8]/60 hover:text-[#1877F2] hover:border-[#1877F2]/60 transition-all duration-300"
                    aria-label="Facebook"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                    </svg>
                  </a>
                )}

                {/* YouTube */}
                {config?.contactYouTube && (
                  <a
                    href={`https://www.youtube.com/@${config.contactYouTube.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 flex items-center justify-center rounded-full border border-[#C9A84C]/20 text-[#F8F3E8]/60 hover:text-[#FF0000] hover:border-[#FF0000]/60 transition-all duration-300"
                    aria-label="YouTube"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
                      <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
                    </svg>
                  </a>
                )}

                {/* WhatsApp */}
                {config?.contactWhatsapp && (() => {
                  let cleanedWhatsapp = config.contactWhatsapp.replace(/\D/g, "");
                  if (cleanedWhatsapp.startsWith("00")) {
                    cleanedWhatsapp = cleanedWhatsapp.substring(2);
                  } else if (cleanedWhatsapp.startsWith("0")) {
                    cleanedWhatsapp = cleanedWhatsapp.substring(1);
                  }
                  if (cleanedWhatsapp.length === 10 && cleanedWhatsapp.startsWith("5")) {
                    cleanedWhatsapp = "90" + cleanedWhatsapp;
                  }
                  if (cleanedWhatsapp.length === 13 && cleanedWhatsapp.startsWith("9005")) {
                    cleanedWhatsapp = "90" + cleanedWhatsapp.substring(3);
                  }

                  return (
                    <a
                      href={`https://wa.me/${cleanedWhatsapp}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 flex items-center justify-center rounded-full border border-[#C9A84C]/20 text-[#F8F3E8]/60 hover:text-[#25D366] hover:border-[#25D366]/60 transition-all duration-300"
                      aria-label="WhatsApp"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                      </svg>
                    </a>
                  );
                })()}
              </div>
              <p className="font-montserrat text-[10px] text-[#F8F3E8]/35 leading-relaxed mt-2">
                Müşteri Hizmetleri: {email}
                <br />
                Tüm gönderiler korumalı kutularda sızdırmaz şişelerle yollanır.
              </p>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-10 sm:mt-14 pt-6 sm:pt-8 border-t border-[#C9A84C]/10 flex flex-col sm:flex-row items-center justify-between text-[10px] font-montserrat text-[#F8F3E8]/30 tracking-wider gap-3">
            <p>
              <Link href="/admin" className="hover:text-[#C9A84C] transition-colors">
                © {currentYear} REAL DEKANT. Tüm Hakları Saklıdır.
              </Link>
            </p>
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
              <Link
                href="/privacy"
                className="hover:text-[#C9A84C] transition-colors uppercase tracking-widest"
              >
                Gizlilik Politikası
              </Link>
              <Link
                href="/terms"
                className="hover:text-[#C9A84C] transition-colors uppercase tracking-widest"
              >
                Kullanım Şartları
              </Link>
              <Link
                href="/distance-sales-agreement"
                className="hover:text-[#C9A84C] transition-colors uppercase tracking-widest"
              >
                Mesafeli Satış
              </Link>
              <Link
                href="/delivery-returns"
                className="hover:text-[#C9A84C] transition-colors uppercase tracking-widest"
              >
                Teslimat ve İade
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
