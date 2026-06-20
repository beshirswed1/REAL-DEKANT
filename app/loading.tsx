import React from "react";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[10000] bg-[#0D0D0D] flex flex-col items-center justify-center overflow-hidden">
      <style>{`
        @keyframes slideRight {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        .animate-slide-right {
          animation: slideRight 2s ease-in-out infinite;
        }
        @keyframes slowSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-slow-spin {
          animation: slowSpin 3s linear infinite;
        }
        .animate-slow-spin-reverse {
          animation: slowSpin 4s linear infinite reverse;
        }
      `}</style>

      {/* Background ambient glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#C9A84C]/15 via-[#0D0D0D]/80 to-[#0D0D0D] opacity-60 animate-pulse" style={{ animationDuration: '4s' }} />

      {/* Main Luxury Loader */}
      <div className="relative z-10 flex flex-col items-center justify-center">
        {/* Outer rotating rings */}
        <div className="relative w-28 h-28 sm:w-36 sm:h-36 flex items-center justify-center">
          {/* Outer Ring */}
          <div className="absolute inset-0 rounded-full border-[1.5px] border-t-[#C9A84C] border-r-transparent border-b-[#C9A84C]/20 border-l-transparent animate-slow-spin" />
          
          {/* Middle Ring */}
          <div className="absolute inset-2 sm:inset-3 rounded-full border-[1px] border-r-[#C9A84C]/80 border-l-transparent border-t-[#C9A84C]/10 border-b-transparent animate-slow-spin-reverse" />
          
          {/* Inner Glow / Droplet metaphor */}
          <div className="absolute w-3 h-3 bg-[#C9A84C] rounded-full animate-ping opacity-60" style={{ animationDuration: '2s' }} />
          <div className="relative w-1.5 h-1.5 bg-[#F8F3E8] rounded-full shadow-[0_0_20px_4px_rgba(201,168,76,0.6)]" />
        </div>

        {/* Brand Typography */}
        <div className="mt-12 flex flex-col items-center space-y-3">
          <h1 className="font-playfair text-[#C9A84C] text-xl sm:text-2xl tracking-[0.4em] uppercase font-bold drop-shadow-[0_0_10px_rgba(201,168,76,0.3)] animate-pulse" style={{ animationDuration: '3s' }}>
            Real Dekant
          </h1>
          <div className="h-[1px] w-12 bg-gradient-to-r from-transparent via-[#C9A84C]/50 to-transparent" />
          <span className="font-montserrat text-[#F8F3E8]/40 text-[9px] sm:text-[10px] tracking-[0.35em] uppercase">
            Lüksün Özü Yükleniyor...
          </span>
        </div>
      </div>
      
      {/* Bottom Loading Bar */}
      <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[#0D0D0D] overflow-hidden">
        <div className="h-full bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent w-1/3 animate-slide-right opacity-80" />
      </div>
    </div>
  );
}
