import React from "react";
import type { Metadata } from "next";
import { getSettingsConfig } from "@/lib/settings-cache";

export const metadata: Metadata = {
  title: "Kullanım Şartları | realdekant",
  description: "Real Dekant web sitesi kullanım şartları, alışveriş kuralları, teslimat ve iade istisnaları koşulları.",
  alternates: {
    canonical: "/terms",
  },
};

export default async function TermsOfUsePage() {
  let termsOfUse: string | null = null;
  let email = "info@realdekant.com";
  const currentYear = new Date().getFullYear();

  try {
    const settings = await getSettingsConfig();
    if (settings) {
      if (settings.termsOfUse) termsOfUse = settings.termsOfUse;
      if (settings.contactEmail) email = settings.contactEmail;
    }
  } catch (err) {
    console.error("Error fetching settings server-side in terms page:", err);
  }

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
            Kullanım Şartları
          </h1>
          <div className="h-[1px] w-20 bg-[#C9A84C]/40 mx-auto mt-4" />
        </div>
      </section>

      {/* Content Section */}
      <section className="py-12 sm:py-16 md:py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="bg-white border border-[#C9A84C]/15 rounded-2xl shadow-sm p-6 sm:p-10 md:p-12 font-montserrat text-sm text-charcoal/80 leading-relaxed space-y-6">
          {termsOfUse ? (
            <div 
              className="prose prose-sm max-w-none whitespace-pre-wrap prose-headings:font-playfair prose-headings:text-charcoal prose-p:text-charcoal/80 prose-li:text-charcoal/80"
              dangerouslySetInnerHTML={{ __html: termsOfUse }}
            />
          ) : (
            <div className="space-y-6">
              <h2 className="font-playfair text-xl font-bold text-charcoal mb-4 pb-2 border-b border-[#C9A84C]/10">
                Kullanım Şartları ve Koşulları
              </h2>
              <p>
                realdekant.com web sitesini ziyaret ederek veya bu siteden alışveriş yaparak, aşağıda belirtilen şartları ve koşulları kabul etmiş sayılırsınız. Lütfen alışveriş yapmadan önce bu maddeleri dikkatlice okuyunuz.
              </p>

              <h3 className="font-playfair text-base font-bold text-charcoal mt-6">1. Ürünlerin Niteliği ve Orijinallik</h3>
              <p>
                Sitemizde satışı yapılan tüm ürünler **%100 orijinal** marka parfümlerden dekant (aktarma) yöntemiyle hazırlanmaktadır. Parfümler, orijinal şişelerinden enjektörler vasıtasıyla profesyonel, steril ve hijyenik koşullarda sızdırmaz küçük cam/akrilik şişelere (dekant şişeleri) aktarılarak gönderilir. Ürünlerin orijinal üreticisi değiliz; sadece orijinal kokuları daha küçük hacimlerde denemenizi sağlayan bağımsız bir dekant hizmetiyiz.
              </p>

              <h3 className="font-playfair text-base font-bold text-charcoal mt-6">2. Alışveriş ve Ödeme Şartları</h3>
              <p>
                Sitemizde Havale/EFT ve Kapıda Ödeme (Nakit) seçenekleri sunulmaktadır. Siparişlerinizi oluştururken verdiğiniz iletişim ve adres bilgilerinin doğruluğundan kullanıcı sorumludur. Yanlış bilgi verilmesi nedeniyle teslim edilemeyen siparişlerin sorumluluğu müşteriye aittir. Kapıda nakit ödeme seçeneğinde, kargo firması tarafından tahsil edilen ek bir hizmet bedeli uygulanabilir.
              </p>

              <h3 className="font-playfair text-base font-bold text-[#1A1A1A] mt-6">3. Kargo ve Teslimat</h3>
              <p>
                Onaylanan siparişleriniz 1-3 iş günü içerisinde kargo firmasına teslim edilir. Pazar günleri ve resmi tatillerde gönderim yapılmamaktadır. Kargo teslimat süresi, kargo firmasının yoğunluğuna ve teslimat adresinizin konumuna göre değişmektedir. Tüm ürünlerimiz özel koruyucu patpatlı ambalajlarda sızdırmazlık bandı çekilmiş olarak gönderilir.
              </p>

              <h3 className="font-playfair text-base font-bold text-charcoal mt-6">4. İade ve Değişim Koşulları</h3>
              <p>
                Dekant parfümler kişisel bakım ürünü kategorisine girdiğinden ve hijyen kuralları gereği, **açılmış veya kullanılmış olan dekant ürünlerin iadesi veya değişimi kesinlikle kabul edilmemektedir**. Ancak, kargo sürecinde kırılan, sızdıran veya yanlış gönderilen ürünler için paketi teslim aldığınız gün bizimle iletişime geçerek durumu bildirmeniz halinde, hasarlı ürünün ücretsiz olarak yenisi yollanır.
              </p>

              <h3 className="font-playfair text-base font-bold text-charcoal mt-6">5. Fikri Mülkiyet ve Ticari Markalar</h3>
              <p>
                Sitede satışı yapılan parfümlerin marka isimleri, logoları ve tasarımları ilgili markaların tescilli sahiplerine aittir. Sitemizde bu markaların kullanılması yalnızca satılan orijinal kokuyu tanımlamak ve tüketiciyi bilgilendirmek amacı taşımaktadır. Real Dekant markasının sitesindeki metinler, görseller ve kodlar izinsiz kopyalanamaz veya ticari amaçla kullanılamaz.
              </p>

              <h3 className="font-playfair text-base font-bold text-charcoal mt-6">6. Değişiklik Hakları</h3>
              <p>
                Real Dekant, önceden haber vermeksizin ürün fiyatları, kargo şartları ve bu kullanım şartları üzerinde değişiklik yapma hakkını saklı tutar. Değişiklikler site üzerinde yayınlandığı andan itibaren geçerli sayılır.
              </p>

              <p className="text-sm">
                Sorularınız veya destek talepleriniz için bize her zaman <strong>{email}</strong> adresi üzerinden ulaşabilirsiniz.
              </p>

              <div className="pt-6 mt-8 border-t border-charcoal/10 flex flex-col sm:flex-row justify-between text-[11px] text-charcoal/45">
                <span>Son Güncelleme: Haziran {currentYear}</span>
                <span>Real Dekant Parfüm</span>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
