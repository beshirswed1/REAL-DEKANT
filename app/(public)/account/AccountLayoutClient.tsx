"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiUser, FiPackage, FiHeart, FiMapPin, FiLogOut, FiChevronRight } from "react-icons/fi";
import { useAuth } from "@/hooks/useAuth";
import { signOut } from "@/lib/firebase/auth";
import { useRouter } from "next/navigation";

export default function AccountLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const router = useRouter();
  
  const tabs = [
    { href: "/account/profile", label: "Profilim", icon: FiUser, description: "Kişisel bilgileriniz" },
    { href: "/account/orders", label: "Siparişlerim", icon: FiPackage, description: "Sipariş takibi" },
    { href: "/account/favorites", label: "Favorilerim", icon: FiHeart, description: "Beğendiğiniz ürünler" },
    { href: "/account/addresses", label: "Adreslerim", icon: FiMapPin, description: "Teslimat adresleri" },
  ];

  const handleLogout = async () => {
    await signOut();
    router.push("/");
  };

  const initials = (user?.displayName || user?.email || "U")
    .split(" ")
    .map(w => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-6 sm:py-12 w-full max-w-full overflow-hidden">
      <div className="block md:flex md:flex-row gap-4 sm:gap-8 w-full max-w-full">
        {/* Sidebar */}
        <aside className="w-full md:w-72 shrink-0 max-w-full overflow-hidden mb-4 md:mb-0">
          <div className="md:bg-white md:rounded-2xl md:shadow-sm md:border md:border-gray-100 md:overflow-hidden bg-transparent border-0 shadow-none overflow-hidden mb-2 md:mb-0 w-full max-w-full">
            {/* User Header — hidden on mobile */}
            <div className="hidden md:block p-6 bg-gradient-to-br from-charcoal to-charcoal/90 text-white">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#C9A84C] to-[#8B6914] flex items-center justify-center text-white text-lg font-playfair font-bold shadow-lg ring-2 ring-white/20">
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="font-playfair font-bold text-lg truncate">
                    {user?.displayName || "Misafir"}
                  </h2>
                  <p className="text-white/60 text-xs truncate mt-0.5">
                    {user?.email || ""}
                  </p>
                </div>
              </div>
            </div>

            {/* Navigation — stacked vertically on mobile and desktop */}
            <nav className="border-b border-gray-100 md:border-b-0 md:p-3 w-full max-w-full">
              <div className="flex flex-col gap-2 md:space-y-1 w-full max-w-full">
                {tabs.map((tab) => {
                  const isActive = pathname === tab.href || pathname.startsWith(tab.href + "/");
                  return (
                    <Link
                      key={tab.href}
                      href={tab.href}
                      className={`flex items-center justify-between py-3 px-4 md:py-3 md:px-4 rounded-xl transition-all w-full border md:border-0 md:border-l-2 rtl:md:border-l-0 rtl:md:border-r-2 ${
                        isActive
                          ? "border-[#C9A84C] bg-[#C9A84C]/5 text-[#8B6914] font-bold md:bg-[#C9A84C]/10 md:border-[#C9A84C]"
                          : "border-gray-100 bg-white md:bg-transparent md:border-transparent text-gray-500 hover:text-charcoal hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <tab.icon className={`w-4 h-4 ${isActive ? "text-[#C9A84C]" : "text-gray-400"}`} />
                        <div>
                          <span className="font-montserrat text-xs uppercase tracking-wider block leading-tight">{tab.label}</span>
                          <span className={`text-[9px] leading-tight hidden md:block mt-0.5 ${isActive ? "text-[#C9A84C]" : "text-gray-400"}`}>
                            {tab.description}
                          </span>
                        </div>
                      </div>
                      <FiChevronRight className={`w-4 h-4 md:hidden transition-transform ${isActive ? "text-[#8B6914] translate-x-0.5" : "text-gray-400"}`} />
                    </Link>
                  );
                })}
              </div>

              {/* Divider — desktop only */}
              <div className="my-3 border-t border-gray-100 hidden md:block" />

              {/* Logout — desktop only, mobile users can logout from profile */}
              <button
                onClick={handleLogout}
                className="hidden md:flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all text-red-500 hover:bg-red-50 hover:text-red-600 group"
              >
                <div className="p-2 rounded-lg bg-red-50 text-red-400 group-hover:bg-red-100 group-hover:text-red-500 transition-colors">
                  <FiLogOut className="w-4 h-4" />
                </div>
                <span className="font-medium text-sm">Çıkış Yap</span>
              </button>
            </nav>
          </div>
        </aside>

        {/* Content Area */}
        <div className="flex-1 min-w-0 bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-3 sm:p-6 md:p-8 max-w-full overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
}
