"use client";

import Link from "next/link";
import { useEffect } from "react";
import { FiAlertTriangle } from "react-icons/fi";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[70vh] bg-cream-light flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 text-center">
      <div className="space-y-6 max-w-md">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-[#C9A84C]/10 rounded-full flex items-center justify-center">
            <FiAlertTriangle className="w-8 h-8 text-[#C9A84C]" />
          </div>
        </div>
        
        <div className="space-y-3">
          <h2 className="font-playfair text-3xl sm:text-4xl font-bold text-charcoal tracking-wide">
            Bir Hata Oluştu
          </h2>
          <p className="font-montserrat text-sm text-charcoal/60 leading-relaxed">
            İşleminizi gerçekleştirirken beklenmeyen bir hata meydana geldi. Lütfen tekrar deneyin veya ana sayfaya dönün.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto px-8 py-3 bg-charcoal text-white font-montserrat text-xs tracking-[0.2em] uppercase font-bold hover:bg-[#C9A84C] transition-colors duration-300"
          >
            Tekrar Dene
          </button>
          
          <Link
            href="/"
            className="w-full sm:w-auto px-8 py-3 bg-transparent border border-charcoal/20 text-charcoal font-montserrat text-xs tracking-[0.2em] uppercase font-bold hover:border-[#C9A84C] hover:text-[#C9A84C] transition-colors duration-300"
          >
            Ana Sayfa
          </Link>
        </div>
      </div>
    </div>
  );
}
