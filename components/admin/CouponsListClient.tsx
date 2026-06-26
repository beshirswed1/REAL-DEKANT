/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import type { FormEvent } from "react";

interface Coupon {
  code: string;
  type: "percentage" | "fixed" | "free_shipping";
  value: number;
  maxUsage: number;
  usageCount: number;
  isActive: boolean;
  productIds: string[];
  expiresAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

interface CouponsListClientProps {
  initialCoupons: Coupon[];
}

export default function CouponsListClient({ initialCoupons }: CouponsListClientProps) {
  const [coupons, setCoupons] = useState<Coupon[]>(initialCoupons);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [couponToDelete, setCouponToDelete] = useState<string | null>(null);

  // Form State
  const [code, setCode] = useState("");
  const [type, setType] = useState<"percentage" | "fixed" | "free_shipping">("percentage");
  const [value, setValue] = useState("");
  const [maxUsage, setMaxUsage] = useState("0");
  const [expiresAt, setExpiresAt] = useState("");
  const [isActive, setIsActive] = useState(true);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAddCoupon = async (e: FormEvent) => {
    e.preventDefault();

    if (!code.trim()) {
      showToast("Kupon kodu gereklidir", "error");
      return;
    }

    if (type !== "free_shipping" && (!value || parseFloat(value) <= 0)) {
      showToast("Geçerli bir indirim değeri giriniz", "error");
      return;
    }

    setLoading(true);
    const newCouponPayload = {
      code: code.trim().toUpperCase(),
      type,
      value: type === "free_shipping" ? 0 : parseFloat(value),
      maxUsage: parseInt(maxUsage) || 0,
      expiresAt: expiresAt || null,
      isActive,
      productIds: [],
    };

    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCouponPayload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Kupon eklenemedi");

      const createdCoupon: Coupon = {
        ...newCouponPayload,
        usageCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setCoupons((prev) => {
        const index = prev.findIndex((c) => c.code === createdCoupon.code);
        if (index >= 0) {
          const updated = [...prev];
          updated[index] = createdCoupon;
          return updated;
        }
        return [createdCoupon, ...prev];
      });

      // Clear Form & Close Modal
      setCode("");
      setValue("");
      setMaxUsage("0");
      setExpiresAt("");
      setIsActive(true);
      setIsModalOpen(false);

      showToast("Kupon başarıyla eklendi / güncellendi", "success");
    } catch (err: any) {
      showToast(err.message || "İşlem başarısız", "error");
    } finally {
      setLoading(false);
    }
  };

  const toggleActiveStatus = async (coupon: Coupon) => {
    const newValue = !coupon.isActive;
    
    setCoupons((prev) =>
      prev.map((c) => (c.code === coupon.code ? { ...c, isActive: newValue } : c))
    );

    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: coupon.code,
          type: coupon.type,
          value: coupon.value,
          maxUsage: coupon.maxUsage,
          expiresAt: coupon.expiresAt,
          isActive: newValue,
        }),
      });

      if (!res.ok) throw new Error();
      showToast("Kupon durumu güncellendi", "success");
    } catch {
      setCoupons((prev) =>
        prev.map((c) => (c.code === coupon.code ? { ...c, isActive: !newValue } : c))
      );
      showToast("Güncelleme başarısız oldu", "error");
    }
  };

  const confirmDelete = (code: string) => {
    setCouponToDelete(code);
  };

  const handleDeleteCoupon = async () => {
    if (!couponToDelete) return;

    setLoading(true);
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponToDelete }),
      });

      if (!res.ok) throw new Error();

      setCoupons((prev) => prev.filter((c) => c.code !== couponToDelete));
      showToast("Kupon silindi", "success");
    } catch {
      showToast("Kupon silinemedi", "error");
    } finally {
      setLoading(false);
      setCouponToDelete(null);
    }
  };

  const formatDate = (isoStr: string | null) => {
    if (!isoStr) return "Süresiz";
    const date = new Date(isoStr);
    return date.toLocaleDateString("tr-TR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold font-playfair text-[#1a1a1a]">Kuponlar</h1>
          <p className="text-[#666] text-sm mt-1">
            İndirim kodlarınızı yönetin ve yenilerini oluşturun
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-[#D4AF37] hover:bg-[#B8960C] text-white px-6 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-[#D4AF37]/20 flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Yeni Kupon
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden">
        <div className="p-6 border-b border-black/5">
          <h2 className="text-lg font-semibold text-[#1a1a1a]">Tüm Kuponlar ({coupons.length})</h2>
        </div>
        
        <div className="overflow-x-auto">
          {coupons.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <div className="w-16 h-16 bg-[#D4AF37]/10 rounded-full flex items-center justify-center mb-4 text-[#D4AF37]">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-[#1a1a1a] mb-1">Henüz kupon yok</h3>
              <p className="text-[#666] mb-6">Müşterilerinize özel indirimler sunmak için ilk kuponunuzu oluşturun.</p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="text-[#D4AF37] font-medium hover:text-[#B8960C] transition-colors"
              >
                Kupon Oluştur &rarr;
              </button>
            </div>
          ) : (
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-[#faf8f2] text-[#888] font-medium">
                <tr>
                  <th className="px-6 py-4 border-b border-black/5">Kupon Kodu</th>
                  <th className="px-6 py-4 border-b border-black/5">İndirim</th>
                  <th className="px-6 py-4 border-b border-black/5 hidden md:table-cell">Kullanım</th>
                  <th className="px-6 py-4 border-b border-black/5 hidden md:table-cell">Son Kullanma</th>
                  <th className="px-6 py-4 border-b border-black/5">Durum</th>
                  <th className="px-6 py-4 border-b border-black/5 text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {coupons.map((coupon) => (
                  <tr key={coupon.code} className="hover:bg-black/[0.01] transition-colors">
                    <td className="px-6 py-4">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#D4AF37]/10 text-[#B8960C] font-mono font-bold tracking-wider">
                        {coupon.code}
                      </div>
                      {/* Mobile-only info (Usage & Expiry) */}
                      <div className="flex flex-col gap-1 mt-1 md:hidden text-[11px] text-gray-500 font-sans font-normal">
                        <span>Kullanım: {coupon.usageCount} / {coupon.maxUsage === 0 ? "Sınırsız" : coupon.maxUsage}</span>
                        <span>Son Kullanma: {formatDate(coupon.expiresAt)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-[#1a1a1a] text-base">
                        {coupon.type === "percentage"
                          ? `%${coupon.value}`
                          : coupon.type === "fixed"
                          ? `₺${coupon.value}`
                          : "Kargo Ücretsiz"}
                      </div>
                      <div className="text-[11px] uppercase tracking-wider text-[#888] mt-0.5">
                        {coupon.type === "percentage"
                          ? "Yüzdelik"
                          : coupon.type === "fixed"
                          ? "Sabit Tutar"
                          : "Kargo"}
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <div className="flex flex-col gap-1.5">
                        <span className="text-xs font-semibold text-[#1a1a1a]">
                          {coupon.usageCount} <span className="text-[#888] font-normal">/ {coupon.maxUsage === 0 ? "Sınırsız" : coupon.maxUsage}</span>
                        </span>
                        <div className="w-full max-w-[120px] h-1.5 bg-black/5 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-[#D4AF37] rounded-full transition-all duration-500" 
                            style={{ 
                              width: coupon.maxUsage === 0 
                                ? '100%' 
                                : `${Math.min(100, (coupon.usageCount / coupon.maxUsage) * 100)}%` 
                            }} 
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <div className="text-[#666] font-medium">
                        {formatDate(coupon.expiresAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={coupon.isActive}
                          onChange={() => toggleActiveStatus(coupon)}
                          disabled={loading}
                        />
                        <div className="w-11 h-6 bg-black/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#22c55e]"></div>
                      </label>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => confirmDelete(coupon.code)}
                        disabled={loading}
                        className="p-2 text-[#888] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors inline-flex items-center justify-center"
                        title="Sil"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add Coupon Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={() => setIsModalOpen(false)} />
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg relative z-10 overflow-hidden transform transition-all">
            <div className="p-6 border-b border-black/5 flex items-center justify-between bg-[#faf8f2]">
              <h2 className="text-xl font-bold font-playfair text-[#1a1a1a]">Yeni Kupon Oluştur</h2>
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-[#888] hover:text-[#1a1a1a] hover:bg-black/5 rounded-full transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleAddCoupon} className="p-6">
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-[#1a1a1a] mb-1.5">Kupon Kodu <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    placeholder="Örn: YAZ10, HOŞGELDİN50"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    disabled={loading}
                    required
                    className="w-full px-4 py-2.5 border border-black/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] uppercase transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#1a1a1a] mb-1.5">Kupon Türü</label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value as any)}
                      disabled={loading}
                      className="w-full px-4 py-2.5 border border-black/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] bg-white transition-all"
                    >
                      <option value="percentage">Yüzdelik (%)</option>
                      <option value="fixed">Sabit (₺)</option>
                      <option value="free_shipping">Ücretsiz Kargo</option>
                    </select>
                  </div>
                  
                  {type !== "free_shipping" && (
                    <div>
                      <label className="block text-sm font-medium text-[#1a1a1a] mb-1.5">İndirim Değeri <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <input
                          type="number"
                          min="0.01"
                          step="0.01"
                          placeholder={type === "percentage" ? "15" : "50"}
                          value={value}
                          onChange={(e) => setValue(e.target.value)}
                          disabled={loading}
                          required
                          className="w-full px-4 py-2.5 border border-black/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] transition-all pl-10"
                        />
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#888] font-medium">
                          {type === "percentage" ? "%" : "₺"}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#1a1a1a] mb-1.5">Maksimum Kullanım</label>
                    <input
                      type="number"
                      min="0"
                      placeholder="Sınırsız için 0"
                      value={maxUsage}
                      onChange={(e) => setMaxUsage(e.target.value)}
                      disabled={loading}
                      className="w-full px-4 py-2.5 border border-black/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] transition-all"
                    />
                    <p className="text-[11px] text-[#888] mt-1.5">0 girilirse sınır uygulanmaz.</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#1a1a1a] mb-1.5">Son Kullanma Tarihi</label>
                    <input
                      type="date"
                      value={expiresAt}
                      onChange={(e) => setExpiresAt(e.target.value)}
                      disabled={loading}
                      className="w-full px-4 py-2.5 border border-black/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] transition-all text-[#1a1a1a]"
                    />
                    <p className="text-[11px] text-[#888] mt-1.5">Boş bırakılırsa süresiz olur.</p>
                  </div>
                </div>

                <div className="pt-2">
                  <label className="flex items-center gap-3 p-4 border border-black/5 rounded-xl bg-[#faf8f2] cursor-pointer hover:bg-[#f5f0e5] transition-colors">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      disabled={loading}
                      className="w-5 h-5 rounded border-gray-300 text-[#D4AF37] focus:ring-[#D4AF37] cursor-pointer"
                    />
                    <div>
                      <div className="font-medium text-[#1a1a1a] text-sm">Hemen Aktifleştir</div>
                      <div className="text-xs text-[#666] mt-0.5">Bu kupon kaydedildiği an kullanılabilir olacak.</div>
                    </div>
                  </label>
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-3 rounded-xl border border-black/10 font-medium text-[#666] hover:bg-black/5 hover:text-[#1a1a1a] transition-all"
                  disabled={loading}
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-[2] px-4 py-3 rounded-xl bg-[#D4AF37] text-white font-medium hover:bg-[#B8960C] shadow-lg shadow-[#D4AF37]/20 transition-all flex justify-center items-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Kaydediliyor...
                    </>
                  ) : (
                    "Kuponu Oluştur"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {couponToDelete && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={() => !loading && setCouponToDelete(null)} />
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm relative z-10 overflow-hidden transform transition-all text-center p-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold font-playfair text-[#1a1a1a] mb-2">Kuponu Sil</h3>
            <p className="text-[#666] text-sm mb-6">
              <span className="font-bold text-[#1a1a1a]">{couponToDelete}</span> kodlu kuponu silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setCouponToDelete(null)}
                disabled={loading}
                className="flex-1 px-4 py-3 rounded-xl border border-black/10 font-medium text-[#666] hover:bg-black/5 hover:text-[#1a1a1a] transition-all"
              >
                İptal
              </button>
              <button
                type="button"
                onClick={handleDeleteCoupon}
                disabled={loading}
                className="flex-1 px-4 py-3 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 shadow-lg shadow-red-600/20 transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Siliniyor...
                  </>
                ) : (
                  "Evet, Sil"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Alert */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[110] transition-all duration-300 transform translate-y-0 opacity-100">
          <div className={`flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl border ${
            toast.type === 'success' 
              ? 'bg-white border-[#22c55e]/20 text-[#1a1a1a]' 
              : 'bg-white border-red-500/20 text-[#1a1a1a]'
          }`}>
            {toast.type === "success" ? (
              <div className="w-8 h-8 rounded-full bg-[#22c55e]/10 flex items-center justify-center text-[#22c55e]">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            )}
            <p className="font-medium">{toast.message}</p>
          </div>
        </div>
      )}
    </>
  );
}
