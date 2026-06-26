"use client";

import React, { useState, useEffect } from "react";
import { FiTruck, FiShield, FiCornerUpLeft, FiAlertTriangle } from "react-icons/fi";

export default function DeliveryReturnsPage() {
  const [email, setEmail] = useState("info@realdekant.com");
  const [shippingFee, setShippingFee] = useState(60);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(1000);
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.contactEmail) setEmail(data.contactEmail);
        if (data.shippingFee) setShippingFee(data.shippingFee);
        if (data.freeShippingThreshold) setFreeShippingThreshold(data.freeShippingThreshold);
      })
      .catch((err) => console.error("Error fetching settings:", err));
  }, []);

  return (
    <div className="flex flex-col bg-cream-light text-charcoal min-h-screen overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative py-20 sm:py-24 bg-[#0D0D0D] overflow-hidden border-b border-[#C9A84C]/20 text-cream">
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#C9A84C] via-transparent to-transparent" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-4">
          <span className="font-montserrat text-xs tracking-[0.45em] text-[#C9A84C] uppercase block">
            Real Dekant
          </span>
          <h1 className="font-playfair text-2xl sm:text-4xl md:text-5xl font-bold tracking-[0.08em] uppercase text-white">
            Teslimat ve İade Politikası
          </h1>
          <div className="h-[1px] w-20 bg-[#C9A84C]/40 mx-auto mt-4" />
        </div>
      </section>

      {/* Content Section */}
      <section className="py-12 sm:py-16 md:py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="bg-white border border-[#C9A84C]/15 rounded-2xl shadow-sm p-6 sm:p-10 md:p-12 font-montserrat text-sm text-charcoal/80 leading-relaxed space-y-8">
          
          {/* Section 1: Delivery */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3 text-[#C9A84C]">
              <FiTruck className="w-6 h-6" />
              <h2 className="font-playfair text-lg sm:text-xl font-bold text-charcoal">
                1. Teslimat Koşulları
              </h2>
            </div>
            <div className="h-[1px] bg-charcoal/10 my-2" />
            <p>
              Siparişleriniz, ödemenizin onaylanmasının ardından en geç **1-3 iş günü** içerisinde kargoya teslim edilmektedir. Hafta sonları ve resmi tatillerde kargo çıkışı yapılmamaktadır.
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Kargo Ücreti:</strong> Sitemiz üzerinden yapılan alışverişlerde kargo ücreti standart olarak **₺{shippingFee}**&apos;dir.</li>
              <li><strong>Ücretsiz Kargo:</strong> **₺{freeShippingThreshold}** ve üzeri alışverişlerinizde kargo ücreti tarafımızca karşılanmaktadır.</li>
              <li><strong>Paketleme Güvencesi:</strong> Dekant şişelerimiz sızdırma ve kırılmaya karşı test edilmiş olup, koruyucu hava kabarcıklı naylonlarla sarmalanmış kutularda güvenle yollanmaktadır.</li>
            </ul>
          </div>

          {/* Section 2: Returns Policy */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3 text-[#C9A84C]">
              <FiCornerUpLeft className="w-6 h-6" />
              <h2 className="font-playfair text-lg sm:text-xl font-bold text-charcoal">
                2. İade Politikası (Cayma Hakkı)
              </h2>
            </div>
            <div className="h-[1px] bg-charcoal/10 my-2" />
            <p>
              Satışa sunduğumuz tüm ürünler, orijinal şişelerinden enjektörler aracılığıyla kişiye özel olarak küçük dekant şişelerine aktarılan kozmetik ürünlerdir.
            </p>
            <div className="bg-red-50 border border-red-200/50 p-4 rounded-xl flex items-start space-x-3 text-red-800">
              <FiAlertTriangle className="w-5 h-5 mt-0.5 mr-2 flex-shrink-0 text-red-600" />
              <p className="text-xs">
                <strong>ÖNEMLİ HİJYEN UYARISI:</strong> 6502 sayılı Tüketicinin Korunması Hakkında Kanun uyarınca; teslim edildikten sonra ambalaj, koruma bandı veya kapağı açılmış kozmetik ve kişisel bakım ürünlerinin hijyenik nedenlerle **iadesi veya değişimi mümkün değildir**. Bu nedenle kokusunu beğenmeme, beklentiyi karşılamama gibi nedenlerle iade kabul edilmemektedir.
              </p>
            </div>
          </div>

          {/* Section 3: Damaged Goods */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3 text-[#C9A84C]">
              <FiShield className="w-6 h-6" />
              <h2 className="font-playfair text-lg sm:text-xl font-bold text-charcoal">
                3. Hasarlı veya Hatalı Ürünler
              </h2>
            </div>
            <div className="h-[1px] bg-charcoal/10 my-2" />
            <p>
              Tüm özenimize rağmen, kargo taşımacılığı sırasında hasar gören (kırılan veya sızdıran) ya da yanlış gönderilen bir ürün teslim alırsanız, haklarınız saklıdır:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Paketi teslim aldığınız gün, hasarlı paketin ve ürünün fotoğrafını/videosunu çekerek <strong>{email}</strong> e-posta adresimize bildirim yapmanız gerekmektedir.</li>
              <li>Yapılan incelemenin ardından, hasarlı veya eksik ürünlerin yenisi hiçbir ek kargo ücreti talep edilmeden **ücretsiz olarak** en kısa sürede adresinize gönderilecektir.</li>
            </ul>
          </div>

          <div className="pt-6 mt-8 border-t border-charcoal/10 flex flex-col sm:flex-row justify-between text-[11px] text-charcoal/45">
            <span>Son Güncelleme: Haziran {currentYear}</span>
            <span>Real Dekant Parfüm</span>
          </div>
        </div>
      </section>
    </div>
  );
}
