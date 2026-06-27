import React from "react";
import type { Metadata } from "next";
import AccountLayoutClient from "./AccountLayoutClient";

export const metadata: Metadata = {
  title: "Hesabım | realdekant",
  description: "Real Dekant kullanıcı hesabı — sipariş geçmişiniz, profil ayarlarınız, teslimat adresleriniz ve favori parfümleriniz.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return <AccountLayoutClient>{children}</AccountLayoutClient>;
}
