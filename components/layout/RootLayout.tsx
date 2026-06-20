"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Header from "./Header";
import Footer from "./Footer";
import CartSidebar from "./CartSidebar";
import LoginModal from "../auth/LoginModal";
import { useAuthInit } from "@/hooks/useAuth";
import { useCartSync } from "@/hooks/useCartSync";

import type { SiteConfig } from "@/components/admin/SettingsForm";

interface RootLayoutProps {
  children: React.ReactNode;
  config?: SiteConfig | null;
}

export default function RootLayout({ children, config }: RootLayoutProps) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  // Initialise Auth state listener
  useAuthInit();

  // Initialise Cart Sync listener (syncs local state with Firestore / localStorage)
  useCartSync();

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-cream-light text-charcoal">
      <Header />
      <main className="flex-grow flex flex-col">{children}</main>
      <CartSidebar />
      <LoginModal />
      <Footer config={config} />
    </div>
  );
}
