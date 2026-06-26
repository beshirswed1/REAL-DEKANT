"use client";

import React, { useState, useEffect } from "react";

export default function DistanceSalesAgreementPage() {
  const [email, setEmail] = useState("info@realdekant.com");
  const [address, setAddress] = useState("İstanbul, Türkiye");
  const [phone, setPhone] = useState("");
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.contactEmail) setEmail(data.contactEmail);
        if (data.contactAddress) setAddress(data.contactAddress);
        if (data.contactPhone) setPhone(data.contactPhone);
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
            Mesafeli Satış Sözleşmesi
          </h1>
          <div className="h-[1px] w-20 bg-[#C9A84C]/40 mx-auto mt-4" />
        </div>
      </section>

      {/* Content Section */}
      <section className="py-12 sm:py-16 md:py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="bg-white border border-[#C9A84C]/15 rounded-2xl shadow-sm p-6 sm:p-10 md:p-12 font-montserrat text-sm text-charcoal/80 leading-relaxed space-y-6">
          <div className="space-y-6">
            <h2 className="font-playfair text-xl font-bold text-charcoal mb-4 pb-2 border-b border-[#C9A84C]/10">
              Mesafeli Satış Sözleşmesi
            </h2>
            <p>
              Bu sözleşme, tüketicinin realdekant.com internet sitesi üzerinden yapacağı alışverişlere ilişkin hak ve yükümlülükleri 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği hükümleri çerçevesinde düzenlemektedir.
            </p>

            <h3 className="font-playfair text-base font-bold text-charcoal mt-6">MADDE 1 - TARAFLAR</h3>
            <div className="space-y-2 pl-4 border-l-2 border-[#C9A84C]/30">
              <p><strong>SATICI:</strong></p>
              <p>Ünvanı: Real Dekant Parfüm</p>
              <p>Adres: {address}</p>
              <p>E-posta: {email}</p>
              {phone && <p>Telefon: {phone}</p>}
              <br />
              <p><strong>ALICI:</strong></p>
              <p>realdekant.com sitesinden sipariş veren ve ödeme yapan müşteri, bundan böyle &quot;Alıcı&quot; olarak adlandırılacaktır. Alıcı&apos;nın sipariş formunda belirttiği bilgiler esas alınır.</p>
            </div>

            <h3 className="font-playfair text-base font-bold text-charcoal mt-6">MADDE 2 - SÖZLEŞME KONUSU ÜRÜNLER</h3>
            <p>
              Sözleşmenin konusu, Alıcı&apos;nın Satıcı&apos;ya ait realdekant.com internet sitesinden elektronik ortamda siparişini verdiği, nitelikleri ve satış fiyatı belirtilen orijinal parfümlerden steril koşullarda aktarılan dekant ürünleridir. Ürünlerin miktarı, hacmi, fiyatı ve teslimat bilgileri sipariş sonundaki onay sayfasında ve sipariş e-postasında belirtildiği gibidir.
            </p>

            <h3 className="font-playfair text-base font-bold text-charcoal mt-6">MADDE 3 - GENEL HÜKÜMLER</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>Alıcı, sitemizdeki sözleşme konusu ürünün temel nitelikleri, satış fiyatı, ödeme şekli ve teslimata ilişkin tüm ön bilgileri okuyup bilgi sahibi olduğunu ve onayladığını beyan eder.</li>
              <li>Satıcı, sözleşme konusu ürünün sağlam, eksiksiz, siparişte belirtilen niteliklere uygun ve varsa kullanım kılavuzları ile teslim edilmesinden sorumludur.</li>
              <li>Sipariş konusu ürünün teslimatı için ürün bedelinin Alıcı&apos;nın tercih ettiği ödeme yöntemi ile (Havale/EFT veya Kapıda Ödeme) ödenmiş olması şarttır. Herhangi bir nedenle ürün bedeli ödenmez veya banka kayıtlarında iptal edilirse, Satıcı ürünün teslimi yükümlülüğünden kurtulmuş kabul edilir.</li>
            </ul>

            <h3 className="font-playfair text-base font-bold text-charcoal mt-6">MADDE 4 - CAYMA HAKKI VE İADE İSTİSNALARI</h3>
            <p>
              Mesafeli Sözleşmeler Yönetmeliği&apos;nin 15. maddesinin (ç) bendi uyarınca; <strong>&quot;Tesliminden sonra ambalaj, bant, mühür, paket gibi koruyucu unsurları açılmış olan mallardan; iadesi sağlık ve hijyen açısından uygun olmayanların iadesi&quot;</strong> mümkün değildir.
            </p>
            <p>
              Bu doğrultuda, satışı yapılan dekant parfümler kişisel bakım ürünü niteliğinde olup, Alıcı tarafından koruyucu ambalajı veya kapağı açılmış olan dekant ürünlerinde <strong>cayma hakkı kullanılamaz ve iade kabul edilmez</strong>. Ancak teslimat anında kargo kaynaklı kırılma veya sızdırma durumlarında hasar tespit edilirse Satıcı yeni ürün göndermeyi taahhüt eder.
            </p>

            <h3 className="font-playfair text-base font-bold text-charcoal mt-6">MADDE 5 - UYUŞMAZLIKLARIN ÇÖZÜMÜ</h3>
            <p>
              Bu sözleşmenin uygulanmasında, Sanayi ve Teknoloji Bakanlığı tarafından ilan edilen değere kadar Tüketici Hakem Heyetleri ile Satıcı&apos;nın yerleşim yerindeki Tüketici Mahkemeleri yetkilidir. Siparişin onaylanması durumunda Alıcı bu sözleşmenin tüm koşullarını kabul etmiş sayılır.
            </p>

            <div className="pt-6 mt-8 border-t border-charcoal/10 flex flex-col sm:flex-row justify-between text-[11px] text-charcoal/45">
              <span>Yürürlük Tarihi: Haziran {currentYear}</span>
              <span>Real Dekant Parfüm</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
