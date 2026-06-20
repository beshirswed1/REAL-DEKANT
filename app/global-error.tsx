"use client";

import { useEffect } from "react";
import { FiAlertTriangle } from "react-icons/fi";

export default function GlobalError({
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
    <html lang="tr">
      <body>
        <div className="min-h-screen bg-[#111] flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 text-center text-cream-light">
          <div className="space-y-6 max-w-md">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-[#C9A84C]/20 rounded-full flex items-center justify-center border border-[#C9A84C]/50">
                <FiAlertTriangle className="w-8 h-8 text-[#C9A84C]" />
              </div>
            </div>
            
            <div className="space-y-3">
              <h2 className="font-playfair text-3xl sm:text-4xl font-bold tracking-wide">
                Kritik Bir Hata Oluştu
              </h2>
              <p className="font-montserrat text-sm text-cream-light/60 leading-relaxed">
                Uygulama yüklenirken beklenmeyen bir sorunla karşılaşıldı. Lütfen sayfayı yenileyin.
              </p>
            </div>

            <div className="flex flex-col items-center justify-center pt-4">
              <button
                onClick={() => reset()}
                className="w-full sm:w-auto px-10 py-3.5 bg-[#C9A84C] text-[#111] font-montserrat text-xs tracking-[0.2em] uppercase font-bold hover:bg-cream-light transition-colors duration-300"
              >
                Yeniden Yükle
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
