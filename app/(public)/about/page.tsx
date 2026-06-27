import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { 
  FiWind, 
  FiHeart, 
  FiFeather, 
  FiTarget,
  FiStar,
  FiSun,
  FiCoffee,
  FiDroplet,
  FiCheckCircle
} from "react-icons/fi";

export const metadata: Metadata = {
  title: "Hakkımızda | realdekant",
  description: "Real Dekant — %100 orijinal designer ve niş parfümlerden steril koşullarda özenle hazırlanan lüks dekant (deneme boyu) koleksiyonu hikayesi.",
  alternates: {
    canonical: "/about",
  },
};

export default function AboutPage() {
  return (
    <div className="flex flex-col bg-cream-light text-charcoal min-h-screen overflow-x-hidden">
      
      {/* 1. HERO SECTION */}
      <section className="relative py-24 sm:py-32 bg-[#0D0D0D] overflow-hidden border-b border-[#C9A84C]/20 text-cream">
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#C9A84C] via-transparent to-transparent" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6">
          <span className="font-montserrat text-xs sm:text-sm tracking-[0.45em] text-[#C9A84C] uppercase block animate-pulse">
            Real Dekant
          </span>
          <h1 className="font-playfair text-2xl sm:text-4xl md:text-6xl font-bold tracking-[0.08em] uppercase text-white leading-tight">
            Neden Dekant Parfüm Tercih Edilmeli?
          </h1>
          <div className="h-[1px] w-24 bg-[#C9A84C]/50 mx-auto my-6" />
          <div className="font-montserrat text-sm sm:text-base tracking-wider text-[#FAF7F0]/80 max-w-3xl mx-auto leading-relaxed space-y-4">
            <p>
              Dekant parfüm, orijinal büyük boy parfüm şişelerinden steril, sızdırmaz ve taşınabilir küçük şişelere aktarılarak hazırlanan orijinal parfüm örnekleridir.
            </p>
            <p>
              Bu yöntem sayesinde parfüm tutkunları, yüksek fiyatlara sahip designer ve niche kokuları çok daha uygun maliyetle deneme fırsatı bulur.
            </p>
          </div>
        </div>
      </section>

      {/* 2. WHY DECANT SECTION */}
      <section className="py-12 sm:py-20 md:py-28 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <h2 className="font-playfair text-2xl sm:text-3xl md:text-4xl font-bold text-charcoal leading-tight">
              Ayrıcalık, detaylarda gizlidir.
            </h2>
            <div className="h-0.5 w-12 bg-[#C9A84C]/50" />
            <div className="font-montserrat text-sm tracking-wider text-charcoal/80 space-y-6 leading-relaxed">
              <p>
                <strong>Real Dekant</strong> olarak tüm dekantlarımızı %100 orijinal parfümlerden, hijyenik koşullarımızda ve özenle hazırlıyoruz.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <FiCheckCircle className="text-[#C9A84C] w-5 h-5 mt-0.5 mr-3 flex-shrink-0" />
                  <span>Dilediğiniz pahalı kokuyu çok daha ekonomik bir şekilde test edin.</span>
                </li>
                <li className="flex items-start">
                  <FiCheckCircle className="text-[#C9A84C] w-5 h-5 mt-0.5 mr-3 flex-shrink-0" />
                  <span>Hafif ve sızdırmaz şişelerle seyahat ve çanta konforunu yaşayın.</span>
                </li>
                <li className="flex items-start">
                  <FiCheckCircle className="text-[#C9A84C] w-5 h-5 mt-0.5 mr-3 flex-shrink-0" />
                  <span>Kısacası dekant parfüm; orijinalliğin güvencesiyle ekonomik, güvenli ve özgür bir keşif deneyimi sunar.</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="relative flex justify-center">
             <div className="relative w-full max-w-[400px] aspect-[4/5] bg-[#0D0D0D] text-cream border border-[#C9A84C]/25 shadow-2xl p-8 flex flex-col justify-center text-center overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-[#C9A84C]/20 via-transparent to-transparent pointer-events-none" />
               <div className="space-y-6 relative z-10">
                 <span className="font-montserrat text-xs tracking-[0.25em] text-[#C9A84C] uppercase font-semibold block">
                   + Koku, Görünmeyen İmzandır
                 </span>
                 <h3 className="font-dancing text-3xl sm:text-4xl text-white leading-relaxed">
                   &quot;Parfüm, yalnızca bir koku değil; karakterin, tarzın ve iz bırakan enerjindir.&quot;
                 </h3>
               </div>
               <div className="absolute bottom-0 left-0 w-32 h-32 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-[#C9A84C]/20 via-transparent to-transparent pointer-events-none" />
             </div>
          </div>
        </div>
      </section>

      {/* 3. ART OF USAGE & MAGIC OF NOTES */}
      <section className="bg-white border-y border-[#C9A84C]/10 py-20 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            
            {/* Kusursuz Kullanımın Sanatı */}
            <div className="space-y-8 bg-cream-light/40 p-10 border border-[#C9A84C]/15 hover:border-[#C9A84C] transition-all duration-300">
              <div className="flex items-center space-x-4">
                <div className="bg-[#0D0D0D] p-3 inline-block">
                  <FiHeart className="w-6 h-6 text-[#C9A84C]" />
                </div>
                <h3 className="font-playfair text-xl font-bold tracking-wide uppercase text-charcoal">
                  + Kusursuz Kullanımın Sanatı
                </h3>
              </div>
              <ul className="font-montserrat text-sm tracking-wider text-charcoal/80 space-y-4">
                <li className="flex items-center">
                  <span className="w-1.5 h-1.5 bg-[#C9A84C] rounded-full mr-3" />
                  Parfüm, temiz tende gerçek kimliğini gösterir.
                </li>
                <li className="flex items-center">
                  <span className="w-1.5 h-1.5 bg-[#C9A84C] rounded-full mr-3" />
                  Nabız noktaları, kokunun en zarif taşıyıcılarıdır.
                </li>
                <li className="flex items-center">
                  <span className="w-1.5 h-1.5 bg-[#C9A84C] rounded-full mr-3" />
                  Dokunma, hisset - koku kendi hikâyesini anlatır.
                </li>
                <li className="flex items-center">
                  <span className="w-1.5 h-1.5 bg-[#C9A84C] rounded-full mr-3" />
                  Mesafe, zarafetin ölçüsüdür.
                </li>
                <li className="flex items-center">
                  <span className="w-1.5 h-1.5 bg-[#C9A84C] rounded-full mr-3" />
                  Az dokunuş, güçlü etki yaratır.
                </li>
              </ul>
            </div>

            {/* Notaların Büyüsü */}
            <div className="space-y-8 bg-cream-light/40 p-10 border border-[#C9A84C]/15 hover:border-[#C9A84C] transition-all duration-300">
              <div className="flex items-center space-x-4">
                <div className="bg-[#0D0D0D] p-3 inline-block">
                  <FiWind className="w-6 h-6 text-[#C9A84C]" />
                </div>
                <h3 className="font-playfair text-xl font-bold tracking-wide uppercase text-charcoal">
                  + Notaların Büyüsü
                </h3>
              </div>
              <div className="font-montserrat text-sm tracking-wider text-charcoal/80 space-y-6">
                <div>
                  <strong className="text-charcoal block mb-1">Üst Notalar:</strong>
                  <span>İlk izlenimin ışıltısı</span>
                </div>
                <div>
                  <strong className="text-charcoal block mb-1">Orta Notalar:</strong>
                  <span>Kokunun kalbindeki zarafet</span>
                </div>
                <div>
                  <strong className="text-charcoal block mb-1">Alt Notalar:</strong>
                  <span>Hafızalarda kalan derin iz</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. SCENT CHARACTERS */}
      <section className="py-12 sm:py-20 md:py-28 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-16">
          <span className="font-montserrat text-[10px] tracking-[0.3em] text-[#C9A84C] uppercase font-semibold">
            Kendini Keşfet
          </span>
          <h2 className="font-playfair text-2xl sm:text-3xl font-bold tracking-wide uppercase text-charcoal">
            + Koku Karakterleri
          </h2>
          <div className="h-0.5 w-12 bg-[#C9A84C]/45 mx-auto mt-2" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {[
            { name: "Fresh", desc: "Saflık ve enerjinin ifadesi", icon: <FiDroplet className="w-6 h-6" /> },
            { name: "Odunsu", desc: "Güç ve karizmanın yansıması", icon: <FiTarget className="w-6 h-6" /> },
            { name: "Oryantal", desc: "Tutkunun sıcak dokunuşu", icon: <FiSun className="w-6 h-6" /> },
            { name: "Çiçeksi", desc: "Zarafetin en narin hali", icon: <FiFeather className="w-6 h-6" /> },
            { name: "Baharatlı", desc: "Gizem ve çekicilik", icon: <FiStar className="w-6 h-6" /> },
            { name: "Gourmand", desc: "Tatlı ve baştan çıkarıcı bir iz", icon: <FiCoffee className="w-6 h-6" /> },
          ].map((char, i) => (
            <div key={i} className="flex items-center p-6 border border-[#C9A84C]/10 bg-white hover:border-[#C9A84C]/50 transition-colors group">
              <div className="text-[#C9A84C] p-3 bg-cream-light mr-4 group-hover:bg-[#0D0D0D] transition-colors">
                {char.icon}
              </div>
              <div>
                <h4 className="font-playfair font-bold text-lg text-charcoal uppercase">{char.name}</h4>
                <p className="font-montserrat text-xs tracking-wider text-charcoal/70 mt-1">{char.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. QUOTES & CLOSING */}
      <section className="bg-[#0D0D0D] border-t border-[#C9A84C]/20 py-20 sm:py-24 text-cream">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12">
          
          <div className="space-y-6">
            <h2 className="font-playfair text-3xl font-bold tracking-wide uppercase text-[#C9A84C]">
              + UNUTMA!!!
            </h2>
            <p className="font-montserrat text-sm sm:text-base tracking-wider text-white leading-relaxed max-w-2xl mx-auto">
              Koku, sen konuşmadan seni anlatır. Doğru seçim unutulmaz bir iz bırakır. <br/><br/>
              <strong className="text-[#C9A84C]">REAL DEKANT</strong> koleksiyonu, dünyanın en iyi kokularını keşfetmek isteyenler için hazırlandı.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8 text-center mt-8 sm:mt-12">
            {[
              "Abartıdan uzak, etkisi derin; sade ama unutulmaz.",
              "Kokunun en zarif hali, en doğru miktarda.",
              "Her seçim, karakterinizin ince bir yansımasıdır.",
              "Fazlasına değil, en iyisine sahip olun.",
              "Gösterişsiz ama unutulmaz.",
              "Sessiz bir lüks: fark edilmeden etkileyen."
            ].map((quote, i) => (
              <div key={i} className="p-6 border border-[#C9A84C]/10 bg-[#1A1A1A]/40 italic font-dancing text-xl sm:text-2xl text-[#FAF7F0]/80">
                &quot;{quote}&quot;
              </div>
            ))}
          </div>

          <div className="pt-12">
            <Link 
              href="/shop" 
              className="inline-block border border-[#C9A84C] text-[#C9A84C] px-10 py-4 tracking-[0.2em] text-xs uppercase font-montserrat transition-all duration-300 bg-transparent hover:bg-[#C9A84C] hover:text-charcoal active:scale-95"
            >
              Koleksiyonu Keşfet
            </Link>
          </div>

        </div>
      </section>

    </div>
  );
}
