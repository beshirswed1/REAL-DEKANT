import React from "react";
import type { Metadata } from "next";
import { getSettingsConfig } from "@/lib/settings-cache";

export const metadata: Metadata = {
  title: "Gizlilik Politikası | realdekant",
  description: "Real Dekant gizlilik ve kişisel verilerin korunması politikası (KVKK bilgilendirmesi).",
  alternates: {
    canonical: "/privacy",
  },
};

export default async function PrivacyPage() {
  let privacyPolicy: string | null = null;
  let email = "info@realdekant.com";
  const currentYear = new Date().getFullYear();

  try {
    const settings = await getSettingsConfig();
    if (settings) {
      if (settings.privacyPolicy) privacyPolicy = settings.privacyPolicy;
      if (settings.contactEmail) email = settings.contactEmail;
    }
  } catch (err) {
    console.error("Error fetching settings server-side in privacy page:", err);
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
            Gizlilik Politikası
          </h1>
          <div className="h-[1px] w-20 bg-[#C9A84C]/40 mx-auto mt-4" />
        </div>
      </section>

      {/* Content Section */}
      <section className="py-12 sm:py-16 md:py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="bg-white border border-[#C9A84C]/15 rounded-2xl shadow-sm p-6 sm:p-10 md:p-12 font-montserrat text-sm text-charcoal/80 leading-relaxed space-y-6">
          {privacyPolicy ? (
            <div 
              className="prose prose-sm max-w-none whitespace-pre-wrap prose-headings:font-playfair prose-headings:text-charcoal prose-p:text-charcoal/80 prose-li:text-charcoal/80"
              dangerouslySetInnerHTML={{ __html: privacyPolicy }}
            />
          ) : (
            <div className="space-y-6">
              <h2 className="font-playfair text-xl font-bold text-charcoal mb-4 pb-2 border-b border-[#C9A84C]/10">
                Gizlilik ve Kişisel Verilerin Korunması Politikası
              </h2>
              <p>
                <strong>Real Dekant</strong> olarak, ziyaretçilerimizin ve müşterilerimizin gizliliğini korumak en öncelikli hedeflerimizden biridir.
                6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) kapsamında, kişisel verilerinizin işlenme şartları, aktarım politikaları ve yasal haklarınız hakkında sizi bilgilendirmek isteriz.
              </p>

              <h3 className="font-playfair text-base font-bold text-charcoal mt-6">1. Toplanan Kişisel Verileriniz</h3>
              <p>
                Sitemizi ziyaret ettiğinizde veya sipariş oluşturduğunuzda aşağıdaki kişisel verileriniz işlenmektedir:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Kimlik Bilgileri:</strong> Adınız, soyadınız.</li>
                <li><strong>İletişim Bilgileri:</strong> Teslimat ve fatura adresiniz, telefon numaranız, e-posta adresiniz.</li>
                <li><strong>İşlem Güvenliği ve Alışveriş Bilgileri:</strong> Sipariş geçmişiniz, ödeme yönteminiz (nakit, havale vb.), IP adresiniz, site içi gezinme verileriniz.</li>
              </ul>

              <h3 className="font-playfair text-base font-bold text-charcoal mt-6">2. Verilerin İşlenme ve Kullanım Amacı</h3>
              <p>
                Kişisel verileriniz, tamamen yasal çerçeveye uygun olarak şu amaçlarla işlenmektedir:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Siparişlerinizin doğru şekilde hazırlanması, paketlenmesi ve adresinize teslim edilmesi.</li>
                <li>Havale/EFT ve kapıda ödeme süreçlerinin doğrulanması ve muhasebeleştirilmesi.</li>
                <li>Müşteri hizmetleri kapsamında sorularınızın yanıtlanması ve destek taleplerinizin çözümlenmesi.</li>
                <li>Yasal mevzuatlardan doğan bilgi saklama ve vergilendirme yükümlülüklerinin yerine getirilmesi.</li>
              </ul>

              <h3 className="font-playfair text-base font-bold text-charcoal mt-6">3. Verilerin Üçüncü Şahıslarla Paylaşımı</h3>
              <p>
                Kişisel verileriniz kesinlikle reklam, pazarlama veya ticari kazanç amacıyla üçüncü taraflarla **paylaşılmaz**. Verileriniz yalnızca siparişin tamamlanması için zorunlu olan iş ortaklarımızla (Kargo firması, SMS bildirim altyapısı sağlayıcısı) paylaşılmaktadır.
              </p>

              <h3 className="font-playfair text-base font-bold text-charcoal mt-6">4. Çerezler (Cookies) Politikası</h3>
              <p>
                Web sitemizde alışveriş sepetinizi hatırlamak, oturumunuzu açık tutmak ve genel kullanıcı trafiğini analiz etmek için çerezler (cookies) kullanılmaktadır. Tarayıcınızın ayarlarından çerez tercihlerinizi değiştirebilirsiniz, ancak çerezleri tamamen kapatmak alışveriş deneyiminizi olumsuz etkileyebilir.
              </p>

              <h3 className="font-playfair text-base font-bold text-charcoal mt-6">5. Veri Güvenliği ve Saklama Süresi</h3>
              <p>
                Verileriniz, yetkisiz erişimi engellemek için SSL (Secure Sockets Layer) şifreleme teknolojisiyle korunan sunucularda saklanmaktadır. Kişisel verileriniz, yasal zorunluluklar ve sipariş geçmişinin takibi için gerekli olan süre boyunca saklanacak ve bu süre sonunda güvenli bir şekilde imha edilecektir.
              </p>

              <h3 className="font-playfair text-base font-bold text-charcoal mt-6">6. Haklarınız (KVKK Madde 11)</h3>
              <p>
                KVKK uyarınca verilerinizin işlenip işlenmediğini öğrenme, işlenmişse bilgi talep etme, düzeltilmesini veya silinmesini isteme haklarına sahipsiniz. Haklarınızı kullanmak için dilediğiniz zaman <strong>{email}</strong> adresi üzerinden bizimle iletişime geçebilirsiniz.
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
