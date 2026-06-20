"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import StatusBadge from "@/components/admin/StatusBadge";
import type { OrderStatus } from "@/types";

interface OrderItem {
  productId: string;
  perfumeName: string;
  brand: string;
  image: string;
  size: string;
  quantity: number;
  unitPrice: number;
}

interface Order {
  id: string;
  orderId: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    city: string;
    district: string;
    address: string;
  };
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  paymentMethod: "credit_card" | "bank_transfer" | "cod" | "whatsapp";
  paymentStatus: "paid" | "pending" | "failed";
  orderStatus: OrderStatus;
  appliedCoupon: string | null;
  trackingNumber: string | null;
  createdAt: string;
  updatedAt: string;
}

interface OrderDetailClientProps {
  order: Order;
}

const ORDER_STATUSES: { value: OrderStatus; label: string }[] = [
  { value: "pending", label: "Beklemede (Pending)" },
  { value: "confirmed", label: "Onaylandı (Confirmed)" },
  { value: "shipped", label: "Kargoya Verildi (Shipped)" },
  { value: "delivered", label: "Teslim Edildi (Delivered)" },
  { value: "cancelled", label: "İptal Edildi (Cancelled)" },
];

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  credit_card: "Kredi Kartı",
  bank_transfer: "Havale / EFT",
  cod: "Kapıda Ödeme",
  whatsapp: "WhatsApp",
};

export default function OrderDetailClient({ order }: OrderDetailClientProps) {
  const router = useRouter();
  const [status, setStatus] = useState<OrderStatus>(order.orderStatus);
  const [trackingNumber, setTrackingNumber] = useState(order.trackingNumber || "");
  const [updating, setUpdating] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleUpdateStatus = async (newStatus: OrderStatus) => {
    setUpdating(true);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: order.id, orderStatus: newStatus }),
      });

      if (!res.ok) throw new Error();

      setStatus(newStatus);
      showToast("Sipariş durumu güncellendi", "success");
      router.refresh();
    } catch {
      showToast("Güncelleme başarısız", "error");
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateTracking = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: order.id, trackingNumber: trackingNumber.trim() || null }),
      });

      if (!res.ok) throw new Error();

      showToast("Takip numarası güncellendi", "success");
      router.refresh();
    } catch {
      showToast("Takip numarası güncellenemedi", "error");
    } finally {
      setUpdating(false);
    }
  };

  // Format Helpers
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
    }).format(amount);
  };

  const formatDate = (isoStr: string) => {
    const date = new Date(isoStr);
    return date.toLocaleDateString("tr-TR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <>
      {/* ─── Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <Link 
            href="/admin/orders" 
            className="flex items-center justify-center w-10 h-10 rounded-xl border border-gray-200 bg-white text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-all shadow-sm"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </Link>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Sipariş Detayı</h1>
              <span className="font-mono text-sm bg-[#D4AF37]/10 text-[#B8960C] font-bold px-2 py-1 rounded">#{order.orderId}</span>
            </div>
            <p className="text-sm text-gray-500">
              {formatDate(order.createdAt)} tarihinde oluşturuldu.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ─── Left Column: Order Items ───────────────────────────────────── */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-lg font-bold text-gray-900">Sipariş İçeriği</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="py-4 px-6 font-medium text-gray-500 uppercase tracking-wider text-xs">Görsel</th>
                    <th className="py-4 px-6 font-medium text-gray-500 uppercase tracking-wider text-xs">Ürün</th>
                    <th className="py-4 px-6 font-medium text-gray-500 uppercase tracking-wider text-xs">Fiyat</th>
                    <th className="py-4 px-6 font-medium text-gray-500 uppercase tracking-wider text-xs">Adet</th>
                    <th className="py-4 px-6 font-medium text-gray-500 uppercase tracking-wider text-xs text-right">Toplam</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {order.items.map((item, index) => (
                    <tr key={index} className="group hover:bg-[#faf8f2] transition-colors">
                      <td className="py-4 px-6">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.perfumeName}
                            className="w-14 h-14 rounded-xl object-cover border border-gray-100 shadow-sm"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-2xl shadow-sm">
                            🧴
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-900 text-sm mb-0.5">{item.brand}</span>
                          <span className="text-gray-600 font-medium text-sm truncate max-w-[250px]">{item.perfumeName}</span>
                          <span className="mt-1 inline-flex w-fit items-center px-2 py-0.5 rounded text-xs font-bold bg-[#D4AF37]/10 text-[#C9A84C]">
                            {item.size}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-gray-600 font-medium">
                        {formatCurrency(item.unitPrice)}
                      </td>
                      <td className="py-4 px-6 font-bold text-gray-900">
                        x{item.quantity}
                      </td>
                      <td className="py-4 px-6 text-right font-bold text-[#D4AF37]">
                        {formatCurrency(item.unitPrice * item.quantity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Calculations Breakdown */}
            <div className="bg-gray-50/50 p-6 border-t border-gray-100">
              <div className="max-w-xs ml-auto flex flex-col gap-3">
                <div className="flex justify-between items-center text-sm text-gray-500 font-medium">
                  <span>Ara Toplam:</span>
                  <span>{formatCurrency(order.subtotal)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between items-center text-sm text-green-600 font-bold">
                    <span>Kupon İndirimi:</span>
                    <span>-{formatCurrency(order.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-sm text-gray-500 font-medium">
                  <span>Kargo Bedeli:</span>
                  <span>{order.shippingFee === 0 ? "Ücretsiz" : formatCurrency(order.shippingFee)}</span>
                </div>
                <div className="flex justify-between items-center text-lg font-bold text-gray-900 pt-3 border-t border-gray-200/60 mt-1">
                  <span>Toplam Tutar:</span>
                  <span>{formatCurrency(order.total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Right Column: Status, Tracking & Customer ────────────────── */}
        <div className="flex flex-col gap-6">
          {/* Status Panel */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-lg font-bold text-gray-900">Sipariş Durumu</h2>
            </div>
            <div className="p-6 flex flex-col gap-5">
              <div>
                <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Mevcut Durum</span>
                <StatusBadge status={status} />
              </div>

              <div>
                <label htmlFor="order-status-select" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Durumu Güncelle
                </label>
                <select
                  id="order-status-select"
                  value={status}
                  onChange={(e) => handleUpdateStatus(e.target.value as OrderStatus)}
                  disabled={updating}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] transition-all cursor-pointer"
                >
                  {ORDER_STATUSES.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Tracking Panel */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-lg font-bold text-gray-900">Kargo & Takip</h2>
            </div>
            <div className="p-6">
              <form onSubmit={handleUpdateTracking} className="flex flex-col gap-4">
                <div>
                  <label htmlFor="tracking-input" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Kargo Takip Numarası
                  </label>
                  <input
                    id="tracking-input"
                    type="text"
                    placeholder="Örn: MNG12345678"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    disabled={updating}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] transition-all"
                  />
                </div>
                <button
                  type="submit"
                  disabled={updating}
                  className="w-full py-2.5 px-4 bg-gray-900 hover:bg-gray-800 text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-50"
                >
                  {updating ? "Güncelleniyor..." : "Takip No Kaydet"}
                </button>
              </form>
            </div>
          </div>

          {/* Customer Panel */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-lg font-bold text-gray-900">Müşteri & Teslimat</h2>
            </div>
            <div className="p-6 flex flex-col gap-6 text-sm">
              <div>
                <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Müşteri Bilgileri</span>
                <strong className="block text-gray-900 text-base mb-1">{order.customer.name}</strong>
                <span className="block text-gray-500 font-medium">{order.customer.email}</span>
                <span className="block text-gray-500 font-medium">{order.customer.phone}</span>
              </div>
              
              <div className="border-t border-gray-100 pt-5">
                <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Teslimat Adresi</span>
                <p className="text-gray-700 mb-1 leading-relaxed">{order.customer.address}</p>
                <p className="font-bold text-gray-900">{order.customer.district} / {order.customer.city}</p>
              </div>
              
              <div className="border-t border-gray-100 pt-5">
                <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Ödeme Detayı</span>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-gray-500">Yöntem:</span>
                  <span className="font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded text-xs">{PAYMENT_METHOD_LABELS[order.paymentMethod] || order.paymentMethod}</span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-gray-500">Durum:</span>
                  <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-bold ${
                    order.paymentStatus === "paid" ? "bg-green-50 text-green-600" : order.paymentStatus === "pending" ? "bg-amber-50 text-amber-600" : "bg-red-50 text-red-600"
                  }`}>
                    {order.paymentStatus === "paid" ? "Ödendi" : order.paymentStatus === "pending" ? "Bekliyor" : "Başarısız"}
                  </span>
                </div>
                {order.appliedCoupon && (
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-gray-500">Kupon:</span>
                    <span className="font-bold text-[#8B6914] bg-[#8B6914]/10 px-2 py-0.5 rounded text-xs">{order.appliedCoupon}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Alert */}
      {toast && (
        <div className={`admin-toast ${toast.type}`} role="alert">
          {toast.type === "success" ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          )}
          {toast.message}
        </div>
      )}
    </>
  );
}
