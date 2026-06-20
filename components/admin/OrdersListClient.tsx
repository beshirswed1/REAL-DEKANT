"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
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

interface OrdersListClientProps {
  initialOrders: Order[];
}

const ITEMS_PER_PAGE = 15;

const STATUS_OPTIONS = [
  { value: "all", label: "Tüm Siparişler" },
  { value: "pending", label: "Bekleyenler" },
  { value: "confirmed", label: "Onaylananlar" },
  { value: "shipped", label: "Kargodakiler" },
  { value: "delivered", label: "Teslim Edilenler" },
  { value: "cancelled", label: "İptal Edilenler" },
];

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  credit_card: "Kredi Kartı",
  bank_transfer: "Havale/EFT",
  cod: "Kapıda Ödeme",
  whatsapp: "WhatsApp",
};

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  paid: "Ödendi",
  pending: "Bekliyor",
  failed: "Başarısız",
};

export default function OrdersListClient({ initialOrders }: OrdersListClientProps) {
  const [orders] = useState<Order[]>(initialOrders);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [page, setPage] = useState(1);

  // ─── Filtering Logic ────────────────────────────────────────────────────────
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // 1. Search Query Match
      const query = search.trim().toLowerCase();
      const matchesSearch = query
        ? order.orderId.toLowerCase().includes(query) ||
          order.customer.name.toLowerCase().includes(query) ||
          order.customer.email.toLowerCase().includes(query) ||
          order.customer.phone.includes(query)
        : true;

      // 2. Status Match
      const matchesStatus = statusFilter === "all" ? true : order.orderStatus === statusFilter;

      // 3. Payment Status Match
      const matchesPayment = paymentFilter === "all" ? true : order.paymentStatus === paymentFilter;

      return matchesSearch && matchesStatus && matchesPayment;
    });
  }, [orders, search, statusFilter, paymentFilter]);

  // ─── Pagination ─────────────────────────────────────────────────────────────
  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
  const paginatedOrders = useMemo(() => {
    return filteredOrders.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
  }, [filteredOrders, page]);

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  const handleStatusFilter = (val: string) => {
    setStatusFilter(val);
    setPage(1);
  };

  const handlePaymentFilter = (val: string) => {
    setPaymentFilter(val);
    setPage(1);
  };

  // ─── Format Helpers ─────────────────────────────────────────────────────────
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
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
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Siparişler</h1>
          <p className="text-sm text-gray-500 mt-1">
            Toplam {filteredOrders.length} sipariş{" "}
            {search || statusFilter !== "all" || paymentFilter !== "all" ? "(filtrelenmiş)" : ""}
          </p>
        </div>
      </div>

      {/* ─── Toolbar ────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="relative flex-1">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] transition-all"
            placeholder="Sipariş ID, müşteri adı veya telefon ara..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            aria-label="Sipariş ara"
          />
        </div>
        
        <select
          className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] transition-all cursor-pointer min-w-[160px]"
          value={statusFilter}
          onChange={(e) => handleStatusFilter(e.target.value)}
          aria-label="Sipariş durumu filtresi"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <select
          className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] transition-all cursor-pointer min-w-[160px]"
          value={paymentFilter}
          onChange={(e) => handlePaymentFilter(e.target.value)}
          aria-label="Ödeme durumu filtresi"
        >
          <option value="all">Tüm Ödemeler</option>
          <option value="paid">Ödendi</option>
          <option value="pending">Beklemede</option>
          <option value="failed">Başarısız</option>
        </select>
      </div>

      {/* ─── Table ──────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {paginatedOrders.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8 text-gray-400">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 01-8 0" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">{search ? "Sonuç bulunamadı" : "Sipariş bulunamadı"}</h3>
              <p className="text-gray-500">Kriterlerinize uygun sipariş bulunmuyor.</p>
            </div>
          ) : (
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="py-4 px-6 font-medium text-gray-500 uppercase tracking-wider text-xs">Sipariş ID</th>
                  <th className="py-4 px-6 font-medium text-gray-500 uppercase tracking-wider text-xs">Müşteri</th>
                  <th className="py-4 px-6 font-medium text-gray-500 uppercase tracking-wider text-xs">Tarih</th>
                  <th className="py-4 px-6 font-medium text-gray-500 uppercase tracking-wider text-xs">Ödeme & Tutar</th>
                  <th className="py-4 px-6 font-medium text-gray-500 uppercase tracking-wider text-xs">Durum</th>
                  <th className="py-4 px-6 font-medium text-gray-500 uppercase tracking-wider text-xs text-right">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paginatedOrders.map((order) => (
                  <tr key={order.id} className="group hover:bg-[#faf8f2] transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-semibold text-gray-900 font-mono text-sm bg-gray-100/80 inline-block px-2 py-1 rounded">
                        #{order.orderId}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-900 text-sm mb-0.5">{order.customer.name}</span>
                        <span className="text-gray-500 font-medium text-xs">{order.customer.email}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-gray-600 font-medium text-sm">
                        {formatDate(order.createdAt)}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col gap-1.5">
                        <span className="font-bold text-[#D4AF37] text-sm">
                          {formatCurrency(order.total)}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                            {PAYMENT_METHOD_LABELS[order.paymentMethod] || order.paymentMethod}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-bold ${
                              order.paymentStatus === "paid"
                                ? "bg-green-50 text-green-600"
                                : order.paymentStatus === "pending"
                                ? "bg-amber-50 text-amber-600"
                                : "bg-red-50 text-red-600"
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              order.paymentStatus === "paid" ? "bg-green-500" : order.paymentStatus === "pending" ? "bg-amber-500" : "bg-red-500"
                            }`}></span>
                            {PAYMENT_STATUS_LABELS[order.paymentStatus] || order.paymentStatus}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <StatusBadge status={order.orderStatus} />
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-xl border border-gray-200 shadow-sm hover:shadow transition-all"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                        İncele
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* ─── Pagination ─────────────────────────────────────────────── */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 bg-gray-50/50 border-t border-gray-100">
              <span className="text-sm text-gray-500 font-medium">
                {(page - 1) * ITEMS_PER_PAGE + 1} – {Math.min(page * ITEMS_PER_PAGE, filteredOrders.length)} <span className="mx-1">/</span> {filteredOrders.length}
              </span>
              <div className="flex items-center gap-2">
                <button
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  type="button"
                >
                  ← Önceki
                </button>
                <button
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  type="button"
                >
                  Sonraki →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

