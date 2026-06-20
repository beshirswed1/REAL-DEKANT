"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiUser, FiPackage, FiHeart, FiMapPin, FiLogOut, FiChevronRight } from "react-icons/fi";
import { useAuth } from "@/hooks/useAuth";
import { signOut } from "@/lib/firebase/auth";
import { useRouter } from "next/navigation";

export default function AccountLayout({ children }: { children: React.ReactNode }) {
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <aside className="w-full md:w-72 shrink-0">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* User Header */}
            <div className="p-6 bg-gradient-to-br from-charcoal to-charcoal/90 text-white">
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

            {/* Navigation */}
            <nav className="p-3">
              <div className="space-y-1">
                {tabs.map((tab) => {
                  const isActive = pathname === tab.href || pathname.startsWith(tab.href + "/");
                  return (
                    <Link
                      key={tab.href}
                      href={tab.href}
                      className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all group ${
                        isActive
                          ? "bg-[#C9A84C]/10 text-[#8B6914] border border-[#C9A84C]/20"
                          : "text-gray-600 hover:bg-gray-50 hover:text-charcoal border border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg transition-colors ${
                          isActive 
                            ? "bg-[#C9A84C]/15 text-[#8B6914]" 
                            : "bg-gray-100 text-gray-400 group-hover:bg-gray-200 group-hover:text-charcoal"
                        }`}>
                          <tab.icon className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-medium text-sm block leading-tight">{tab.label}</span>
                          <span className={`text-[10px] leading-tight ${isActive ? "text-[#C9A84C]" : "text-gray-400"}`}>
                            {tab.description}
                          </span>
                        </div>
                      </div>
                      <FiChevronRight className={`w-4 h-4 transition-transform ${
                        isActive ? "text-[#C9A84C]" : "text-gray-300 group-hover:translate-x-0.5"
                      }`} />
                    </Link>
                  );
                })}
              </div>

              {/* Divider */}
              <div className="my-3 border-t border-gray-100" />

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all text-red-500 hover:bg-red-50 hover:text-red-600 group"
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
        <div className="flex-1 min-w-0 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
