import React from "react";
import type { Metadata } from "next";
import CheckoutClient from "./CheckoutClient";

export const metadata: Metadata = {
  title: "Güvenli Ödeme | realdekant",
  description: "Real Dekant güvenli ödeme sayfası. Siparişinizi tamamlamak için bilgilerinizi girin.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function CheckoutPage() {
  return <CheckoutClient />;
}
