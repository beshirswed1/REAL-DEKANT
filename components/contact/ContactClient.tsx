"use client";

import React, { useState } from "react";
import { 
  FiPhone, 
  FiMail, 
  FiMapPin, 
  FiClock, 
  FiSend,
  FiInstagram
} from "react-icons/fi";
import { 
  FaWhatsapp, 
  FaTiktok, 
  FaSnapchatGhost 
} from "react-icons/fa";

interface ContactConfig {
  contactPhone: string;
  contactWhatsapp: string;
  contactEmail: string;
  contactAddress: string;
  contactWorkingHours: string;
  contactInstagram: string;
  contactTikTok?: string;
  contactSnapchat?: string;
  contactMapsUrl?: string;
}

interface ContactClientProps {
  config: ContactConfig;
}

export default function ContactClient({ config }: ContactClientProps) {
  const cleanWhatsappNumber = config.contactWhatsapp.replace(/[^\d+]/g, "");
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (msg: string, type: "success" | "error") => {
    setToast({ message: msg, type });
    setTimeout(() => setToast(null), 5000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !message.trim()) {
      showToast("Lütfen adınızı ve mesajınızı doldurun.", "error");
      return;
    }

    setLoading(true);

    try {
      // 1. Save to Firestore via local API route first for Admin tracking
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          subject: subject.trim() || "Genel Bilgi Talebi",
          message: message.trim(),
        }),
      });

      if (!res.ok) {
        throw new Error("API error");
      }

      // 2. Format WhatsApp redirect link
      const textMessage = `Merhaba, Ben *${name.trim()}*.\n\n*Konu:* ${subject.trim() || "Genel Bilgi"}\n*Mesaj:* ${message.trim()}`;
      const encodedText = encodeURIComponent(textMessage);
      const whatsappUrl = `https://wa.me/${cleanWhatsappNumber}?text=${encodedText}`;

      // Open in a new tab
      window.open(whatsappUrl, "_blank");

      // Show success toast
      showToast("Mesajınız kaydedildi. WhatsApp'a yönlendiriliyorsunuz...", "success");

      // Reset form
      setName("");
      setSubject("");
      setMessage("");
    } catch (error) {
      console.error("Form submit error:", error);
      showToast("Bir hata oluştu, ancak doğrudan WhatsApp üzerinden bize yazabilirsiniz.", "error");
      
      // Fallback redirect directly
      const textMessage = `Merhaba, Ben *${name.trim()}*.\n\n*Konu:* ${subject.trim() || "Genel Bilgi"}\n*Mesaj:* ${message.trim()}`;
      const encodedText = encodeURIComponent(textMessage);
      const whatsappUrl = `https://wa.me/${cleanWhatsappNumber}?text=${encodedText}`;
      setTimeout(() => {
        window.open(whatsappUrl, "_blank");
      }, 1500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col bg-cream-light text-charcoal min-h-screen overflow-x-hidden">
      
      {/* 1. HERO SECTION */}
      <section className="relative py-24 sm:py-32 bg-[#0D0D0D] overflow-hidden border-b border-[#C9A84C]/25 text-[#FAF7F0]">
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#C9A84C] via-transparent to-transparent" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6">
          <span className="font-montserrat text-xs sm:text-sm tracking-[0.45em] text-[#C9A84C] uppercase block animate-pulse">
            BİZE ULAŞIN
          </span>
          <h1 className="font-playfair text-4xl sm:text-6xl font-bold tracking-[0.08em] uppercase text-white leading-tight">
            İLETİŞİM KANALLARI
          </h1>
          <div className="h-[1px] w-24 bg-[#C9A84C]/50 mx-auto my-6" />
          <p className="font-montserrat text-sm sm:text-base tracking-wider text-[#FAF7F0]/80 max-w-xl mx-auto leading-relaxed">
            %100 orijinal niş ve lüks parfüm dekantları dünyasıyla ilgili merak ettikleriniz ve sorularınız için bizimle iletişime geçin.
          </p>
        </div>
      </section>

      {/* 2. CHANNELS & FORM SECTION */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          {/* Left: Contact Channels (5 Cols) */}
          <div className="lg:col-span-5 space-y-10">
            <div className="space-y-4">
              <h2 className="font-playfair text-3xl sm:text-4xl font-bold text-charcoal">
                Doğrudan İletişim
              </h2>
              <p className="font-montserrat text-xs sm:text-sm tracking-wider text-charcoal/60">
                Merak ettiğiniz kokular, siparişleriniz veya özel talepleriniz için aşağıdaki kanallardan bize anında ulaşabilirsiniz.
              </p>
              <div className="h-[1px] w-16 bg-[#C9A84C]" />
            </div>

            {/* Direct Cards */}
            <div className="space-y-4">
              
              {/* WhatsApp Card */}
              <a 
                href={`https://wa.me/${cleanWhatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center p-6 bg-white border border-[#C9A84C]/15 hover:border-[#25D366] rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 group"
              >
                <div className="p-4 bg-emerald-50 text-[#25D366] rounded-xl mr-5 group-hover:scale-110 transition-transform">
                  <FaWhatsapp className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-playfair font-bold text-[16px] text-charcoal uppercase tracking-wider">WhatsApp Canlı Destek</h4>
                  <p className="font-montserrat text-xs text-charcoal/60 mt-1">Anında yanıt alın</p>
                  <p className="font-montserrat text-[13px] font-semibold text-charcoal mt-1">+{config.contactWhatsapp}</p>
                </div>
              </a>

              {/* Phone Call Card */}
              <a 
                href={`tel:${config.contactPhone}`}
                className="flex items-center p-6 bg-white border border-[#C9A84C]/15 hover:border-[#C9A84C] rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 group"
              >
                <div className="p-4 bg-amber-50 text-[#C9A84C] rounded-xl mr-5 group-hover:scale-110 transition-transform">
                  <FiPhone className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-playfair font-bold text-[16px] text-charcoal uppercase tracking-wider">Müşteri İlişkileri</h4>
                  <p className="font-montserrat text-xs text-charcoal/60 mt-1">Bizi doğrudan arayın</p>
                  <p className="font-montserrat text-[13px] font-semibold text-charcoal mt-1">{config.contactPhone}</p>
                </div>
              </a>

              {/* Email Card */}
              <a 
                href={`mailto:${config.contactEmail}`}
                className="flex items-center p-6 bg-white border border-[#C9A84C]/15 hover:border-[#C9A84C] rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 group"
              >
                <div className="p-4 bg-amber-50 text-[#C9A84C] rounded-xl mr-5 group-hover:scale-110 transition-transform">
                  <FiMail className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-playfair font-bold text-[16px] text-charcoal uppercase tracking-wider">E-Posta</h4>
                  <p className="font-montserrat text-xs text-charcoal/60 mt-1">7/24 Mail Gönderebilirsiniz</p>
                  <p className="font-montserrat text-[13px] font-semibold text-charcoal mt-1">{config.contactEmail}</p>
                </div>
              </a>

              {/* Working Hours Card */}
              <div className="flex items-center p-6 bg-white/70 border border-[#C9A84C]/10 rounded-2xl shadow-sm">
                <div className="p-4 bg-amber-50/50 text-[#C9A84C] rounded-xl mr-5">
                  <FiClock className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-playfair font-bold text-[16px] text-charcoal uppercase tracking-wider">Çalışma Saatleri</h4>
                  <p className="font-montserrat text-xs text-charcoal/60 mt-1">Destek Hattı Çalışma Saatleri</p>
                  <p className="font-montserrat text-[13px] font-semibold text-charcoal mt-1">{config.contactWorkingHours}</p>
                </div>
              </div>

            </div>

            {/* Social Accounts Section */}
            <div className="pt-6 border-t border-[#C9A84C]/10">
              <h3 className="font-playfair font-bold text-lg text-charcoal uppercase tracking-wider mb-4">Sosyal Medya</h3>
              <div className="flex flex-wrap gap-4">
                
                {/* Instagram */}
                {config.contactInstagram && (
                  <a 
                    href={`https://instagram.com/${config.contactInstagram}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center px-4 py-2 border border-[#C9A84C]/20 rounded-full bg-white text-charcoal/70 hover:text-[#C9A84C] hover:border-[#C9A84C] transition-all text-xs font-semibold uppercase tracking-wider"
                  >
                    <FiInstagram className="mr-2 w-4 h-4 text-[#C9A84C]" />
                    @{config.contactInstagram}
                  </a>
                )}

                {/* TikTok */}
                {config.contactTikTok && (
                  <a 
                    href={`https://tiktok.com/@${config.contactTikTok}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center px-4 py-2 border border-[#C9A84C]/20 rounded-full bg-white text-charcoal/70 hover:text-black hover:border-black transition-all text-xs font-semibold uppercase tracking-wider"
                  >
                    <FaTiktok className="mr-2 w-4 h-4 text-black" />
                    @{config.contactTikTok}
                  </a>
                )}

                {/* Snapchat */}
                {config.contactSnapchat && (
                  <a 
                    href={`https://snapchat.com/add/${config.contactSnapchat}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center px-4 py-2 border border-[#C9A84C]/20 rounded-full bg-white text-charcoal/70 hover:text-yellow-500 hover:border-yellow-500 transition-all text-xs font-semibold uppercase tracking-wider"
                  >
                    <FaSnapchatGhost className="mr-2 w-4 h-4 text-yellow-500" />
                    @{config.contactSnapchat}
                  </a>
                )}

              </div>
            </div>
          </div>

          {/* Right: Contact Form redirected to WhatsApp (7 Cols) */}
          <div className="lg:col-span-7 bg-[#FAF7F0] border border-[#C9A84C]/20 rounded-3xl p-8 sm:p-10 shadow-[0_10px_30px_rgba(201,168,76,0.05)] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-[#C9A84C]/10 via-transparent to-transparent pointer-events-none" />
            
            <div className="mb-8 space-y-3">
              <span className="font-dancing text-xl text-[#C9A84C]">Hızlı İletişim Formu</span>
              <h3 className="font-playfair text-2xl sm:text-3xl font-bold text-charcoal">WhatsApp ile Mesaj Gönder</h3>
              <p className="font-montserrat text-xs text-charcoal/60">
                Aşağıdaki formu doldurup gönderdiğinizde, mesajınız sistemimize kaydedilecek ve anında WhatsApp canlı destek hattımıza yönlendirileceksiniz.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Name Input */}
              <div className="space-y-1.5">
                <label htmlFor="user-name" className="block text-xs font-semibold text-charcoal/80 uppercase tracking-widest">
                  Adınız ve Soyadınız <span className="text-red-500">*</span>
                </label>
                <input
                  id="user-name"
                  type="text"
                  required
                  placeholder="örn: Ahmet Yılmaz"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                  className="w-full px-5 py-3.5 bg-white border border-[#C9A84C]/20 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/40 focus:border-[#C9A84C] transition-all disabled:opacity-60"
                />
              </div>

              {/* Subject Input */}
              <div className="space-y-1.5">
                <label htmlFor="user-subject" className="block text-xs font-semibold text-charcoal/80 uppercase tracking-widest">
                  Konu
                </label>
                <input
                  id="user-subject"
                  type="text"
                  placeholder="örn: Sipariş Durumu, Koku Danışmanlığı..."
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  disabled={loading}
                  className="w-full px-5 py-3.5 bg-white border border-[#C9A84C]/20 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/40 focus:border-[#C9A84C] transition-all disabled:opacity-60"
                />
              </div>

              {/* Message Input */}
              <div className="space-y-1.5">
                <label htmlFor="user-message" className="block text-xs font-semibold text-charcoal/80 uppercase tracking-widest">
                  Mesajınız <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="user-message"
                  required
                  rows={4}
                  placeholder="Talebinizi detaylıca buraya yazın..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  disabled={loading}
                  className="w-full px-5 py-3.5 bg-white border border-[#C9A84C]/20 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/40 focus:border-[#C9A84C] transition-all disabled:opacity-60 resize-none"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-luxury-dark py-4 text-xs font-bold tracking-[0.25em] flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-95 transition-all shadow-sm"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Yönlendiriliyor...
                  </>
                ) : (
                  <>
                    <FiSend size={14} />
                    WHATSAPP İLE GÖNDER
                  </>
                )}
              </button>

            </form>
          </div>

        </div>
      </section>

      {/* 3. ADRESS & MAP SECTION */}
      <section className="py-16 bg-white border-t border-[#C9A84C]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left: Map Pin details */}
            <div className="lg:col-span-5 space-y-6">
              <div className="flex items-center space-x-3 text-[#C9A84C]">
                <FiMapPin className="w-6 h-6" />
                <h3 className="font-playfair text-xl font-bold uppercase tracking-wider text-charcoal">Showroom & Merkez</h3>
              </div>
              <p className="font-montserrat text-sm tracking-wider text-charcoal/80 leading-relaxed">
                {config.contactAddress}
              </p>
              <div className="h-0.5 w-12 bg-[#C9A84C]/50" />
              <p className="font-montserrat text-xs text-charcoal/50 leading-relaxed italic">
                Orijinal parfümlerimizin steril ortamlarda saklandığı ve titizlikle dekant edildiği merkez ofisimiz.
              </p>
            </div>

            {/* Right: Map Embed or Boutique Block */}
            <div className="lg:col-span-7 w-full">
              {config.contactMapsUrl ? (
                <div className="relative w-full aspect-video rounded-3xl overflow-hidden border border-[#C9A84C]/20 shadow-md">
                  <iframe 
                    src={config.contactMapsUrl} 
                    width="100%" 
                    height="100%" 
                    style={{ border: 0 }} 
                    allowFullScreen={false} 
                    loading="lazy" 
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Real Dekant Location Map"
                    className="grayscale hover:grayscale-0 transition-all duration-700"
                  />
                </div>
              ) : (
                <div className="relative w-full aspect-video bg-[#0D0D0D] text-cream-light border border-[#C9A84C]/25 rounded-3xl p-8 flex flex-col justify-center text-center overflow-hidden shadow-xl group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-[#C9A84C]/15 via-transparent to-transparent pointer-events-none" />
                  <div className="space-y-4 relative z-10">
                    <span className="font-montserrat text-xs tracking-[0.25em] text-[#C9A84C] uppercase font-semibold block">
                      + Premium Niş Deneyimi
                    </span>
                    <h3 className="font-dancing text-2xl sm:text-3xl text-white">
                      &quot;Kokunuz, fark edildiğiniz andan hafızalarda kaldığınız ana kadar sizinle.&quot;
                    </h3>
                    <p className="font-montserrat text-xs tracking-wider text-white/60 max-w-md mx-auto">
                      Real Dekant butik koleksiyon merkezimizde, dünyanın en prestijli designer ve niche parfümleri en steril şartlarda hazırlanır.
                    </p>
                  </div>
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-[#C9A84C]/15 via-transparent to-transparent pointer-events-none" />
                </div>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* Toast Overlay */}
      {toast && (
        <div 
          className={`fixed bottom-6 right-6 z-[999] flex items-center gap-3 px-6 py-4 rounded-2xl border text-sm font-semibold tracking-wider font-montserrat shadow-xl animate-fade-in ${
            toast.type === "success" 
              ? "bg-[#0D0D0D] border-[#C9A84C] text-[#F8F3E8]" 
              : "bg-red-950 border-red-500 text-red-200"
          }`}
          role="alert"
        >
          {toast.type === "success" ? (
            <div className="w-5 h-5 rounded-full bg-[#C9A84C] text-charcoal flex items-center justify-center text-xs">✓</div>
          ) : (
            <div className="w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center text-xs">!</div>
          )}
          {toast.message}
        </div>
      )}

    </div>
  );
}
