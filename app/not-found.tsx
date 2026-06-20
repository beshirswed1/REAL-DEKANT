import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] bg-cream-light flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 text-center relative overflow-hidden">
      
      {/* Abstract Background Element */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#C9A84C] opacity-[0.03] select-none pointer-events-none font-playfair font-bold text-[300px] leading-none z-0">
        404
      </div>

      <div className="relative z-10 space-y-6 max-w-lg mx-auto">
        <div className="space-y-3">
          <span className="font-montserrat text-sm tracking-[0.3em] text-[#C9A84C] uppercase font-bold">
            Hata 404
          </span>
          <h1 className="font-playfair text-4xl sm:text-5xl md:text-6xl font-bold text-charcoal tracking-wide uppercase">
            Sayfa Bulunamadı
          </h1>
          <div className="w-16 h-px bg-[#C9A84C]/50 mx-auto my-4" />
          <p className="font-montserrat text-sm text-charcoal/60 leading-relaxed max-w-md mx-auto">
            Aradığınız sayfa silinmiş, adı değiştirilmiş veya geçici olarak kullanım dışı olabilir.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
          <Link
            href="/shop"
            className="w-full sm:w-auto px-8 py-3.5 bg-charcoal text-white font-montserrat text-xs tracking-[0.2em] uppercase font-bold hover:bg-[#C9A84C] transition-colors duration-300 shadow-lg"
          >
            Kataloğa Git
          </Link>
          
          <Link
            href="/"
            className="w-full sm:w-auto px-8 py-3.5 bg-transparent border border-charcoal/20 text-charcoal font-montserrat text-xs tracking-[0.2em] uppercase font-bold hover:border-[#C9A84C] hover:text-[#C9A84C] transition-colors duration-300"
          >
            Ana Sayfa
          </Link>
        </div>
      </div>
    </div>
  );
}
