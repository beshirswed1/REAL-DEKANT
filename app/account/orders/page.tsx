"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  collection,
  query,
  where,
  getDocs,
  Timestamp,
  doc,
  deleteDoc,
  writeBatch,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { FiPackage, FiChevronDown, FiChevronUp, FiChevronLeft, FiChevronRight, FiTrash2, FiAlertCircle } from "react-icons/fi";
import Image from "next/image";

interface OrderItem {
  productId: string;
  brand: string;
  perfumeName: string;
  size: string;
  unitPrice: number;
  quantity: number;
  image: string;
}

interface Order {
  id: string;
  orderId?: string;
  createdAt: Timestamp | null;
  orderStatus: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  total: number;
  items: OrderItem[];
}

const statusMap = {
  pending: { label: "Bekliyor", color: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  confirmed: { label: "Onaylandı", color: "bg-blue-100 text-blue-800 border-blue-200" },
  shipped: { label: "Kargoya Verildi", color: "bg-indigo-100 text-indigo-800 border-indigo-200" },
  delivered: { label: "Teslim Edildi", color: "bg-green-100 text-green-800 border-green-200" },
  cancelled: { label: "İptal Edildi", color: "bg-red-100 text-red-800 border-red-200" },
};

const PAGE_SIZE = 10;

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);

  // Delete confirmation state
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: "single" | "all"; orderId?: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Deduplicate orders by orderId (keep the first occurrence)
  const deduplicateOrders = (fetchedOrders: Order[]): Order[] => {
    const seen = new Set<string>();
    const unique: Order[] = [];
    for (const order of fetchedOrders) {
      const key = order.orderId || order.id;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(order);
      }
    }
    return unique;
  };

  const fetchOrders = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    try {
      const q = query(
        collection(db, "orders"),
        where("userId", "==", user.uid)
      );
      const snapshot = await getDocs(q);
      const fetchedOrders: Order[] = [];
      snapshot.forEach((doc) => {
        fetchedOrders.push({ id: doc.id, ...doc.data() } as Order);
      });

      // Deduplicate
      const uniqueOrders = deduplicateOrders(fetchedOrders);

      // Sort by date client-side (newest first)
      uniqueOrders.sort((a, b) => {
        const dateA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
        const dateB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
        return dateB - dateA;
      });

      setAllOrders(uniqueOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    fetchOrders();
  }, [user, fetchOrders]);

  // Paginate client-side
  useEffect(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    setOrders(allOrders.slice(start, end));
  }, [allOrders, currentPage]);

  const totalPages = Math.ceil(allOrders.length / PAGE_SIZE);
  const hasMore = currentPage < totalPages;

  const goToPage = (page: number) => {
    setCurrentPage(page);
    setExpandedId(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ─── Delete single order ──────────────────────────────────────────────────
  const handleDeleteOrder = async (orderId: string, docId: string) => {
    setDeleting(true);
    try {
      // Delete the order document
      await deleteDoc(doc(db, "orders", docId));
      
      // Also try to delete any duplicates with the same orderId
      if (orderId && orderId !== docId) {
        try {
          // Check if there are duplicate docs with the same orderId field
          const dupeQuery = query(
            collection(db, "orders"),
            where("userId", "==", user?.uid),
            where("orderId", "==", orderId)
          );
          const dupeSnap = await getDocs(dupeQuery);
          const batch = writeBatch(db);
          dupeSnap.forEach((d) => {
            batch.delete(d.ref);
          });
          await batch.commit();
        } catch (dupeErr) {
          console.warn("Could not delete duplicates:", dupeErr);
        }
      }

      // Update local state
      setAllOrders((prev) => prev.filter((o) => o.id !== docId && o.orderId !== orderId));
      setDeleteConfirm(null);
    } catch (error) {
      console.error("Error deleting order:", error);
      alert("Sipariş silinirken bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setDeleting(false);
    }
  };

  // ─── Delete ALL orders ──────────────────────────────────────────────────
  const handleDeleteAllOrders = async () => {
    if (!user) return;
    setDeleting(true);
    try {
      const q = query(
        collection(db, "orders"),
        where("userId", "==", user.uid)
      );
      const snapshot = await getDocs(q);

      // Firestore batch delete (max 500 per batch)
      const batchSize = 500;
      const docs = snapshot.docs;
      
      for (let i = 0; i < docs.length; i += batchSize) {
        const batch = writeBatch(db);
        const chunk = docs.slice(i, i + batchSize);
        chunk.forEach((d) => {
          batch.delete(d.ref);
        });
        await batch.commit();
      }

      // Clear local state
      setAllOrders([]);
      setOrders([]);
      setCurrentPage(1);
      setDeleteConfirm(null);
    } catch (error) {
      console.error("Error deleting all orders:", error);
      alert("Siparişler silinirken bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold-primary"></div>
      </div>
    );
  }

  if (allOrders.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-50 mb-4">
          <FiPackage className="w-8 h-8 text-gray-400" />
        </div>
        <h2 className="text-xl font-playfair font-bold text-charcoal mb-2">Sipariş Bulunamadı</h2>
        <p className="text-gray-500">Henüz hiç sipariş vermemişsiniz.</p>
      </div>
    );
  }

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-playfair font-bold text-charcoal mb-1">Siparişlerim</h2>
          <p className="text-sm text-gray-500">
            Toplam {allOrders.length} sipariş · Sayfa {currentPage}/{totalPages || 1}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Delete All Orders Button */}
          <button
            onClick={() => setDeleteConfirm({ type: "all" })}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg border border-red-100 hover:bg-red-100 hover:text-red-700 transition-colors"
          >
            <FiTrash2 className="w-4 h-4" />
            Tüm Siparişleri Sil
          </button>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {orders.map((order) => {
          const date = order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString("tr-TR", {
            day: "numeric", month: "long", year: "numeric"
          }) : "Tarih Yok";

          const statusInfo = statusMap[order.orderStatus] || statusMap.pending;
          const isExpanded = expandedId === order.id;
          const orderNum = order.orderId || order.id.slice(0, 8).toUpperCase();

          return (
            <div key={order.id} className="border border-gray-100 rounded-xl bg-white overflow-hidden shadow-sm transition-shadow hover:shadow-md">
              {/* Order Header */}
              <div
                className="flex items-center justify-between p-4 sm:p-6 cursor-pointer bg-gray-50/50"
                onClick={() => toggleExpand(order.id)}
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Sipariş No</p>
                    <p className="font-mono text-sm font-medium text-charcoal">{orderNum}</p>
                  </div>
                  <div className="hidden sm:block w-px h-8 bg-gray-200"></div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Sipariş Tarihi</p>
                    <p className="font-medium text-charcoal">{date}</p>
                  </div>
                  <div className="hidden sm:block w-px h-8 bg-gray-200"></div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Toplam</p>
                    <p className="font-medium text-[#C9A84C] font-semibold">{order.total.toLocaleString("tr-TR")} ₺</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`text-xs font-medium px-3 py-1 rounded-full border ${statusInfo.color}`}>
                    {statusInfo.label}
                  </span>
                  <button
                    className="text-gray-400 hover:text-charcoal p-1 rounded-full hover:bg-gray-100 transition-colors"
                    onClick={(e) => { e.stopPropagation(); toggleExpand(order.id); }}
                  >
                    {isExpanded ? <FiChevronUp className="w-5 h-5" /> : <FiChevronDown className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Order Details (Expanded) */}
              {isExpanded && (
                <div className="p-4 sm:p-6 border-t border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Sipariş No</p>
                      <p className="font-mono text-sm">{orderNum}</p>
                    </div>
                    {/* Delete single order button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteConfirm({ type: "single", orderId: order.id });
                      }}
                      className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-red-500 bg-red-50 rounded-lg border border-red-100 hover:bg-red-100 hover:text-red-600 transition-colors"
                    >
                      <FiTrash2 className="w-3.5 h-3.5" />
                      Siparişi Sil
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {order.items?.map((item, idx) => {
                      const itemName = `${item.brand} - ${item.perfumeName}`;
                      return (
                        <div key={idx} className="flex items-center gap-4 py-3 border-b border-gray-50 last:border-0">
                          <div className="relative w-16 h-16 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                            {item.image ? (
                              <Image src={item.image} alt={itemName} fill className="object-cover" />
                            ) : (
                              <div className="w-full h-full bg-gray-200"></div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-charcoal truncate">{itemName}</h4>
                            <p className="text-sm text-gray-500">{item.size}</p>
                          </div>
                          <div className="text-right font-montserrat">
                            <p className="font-medium text-charcoal">{item.unitPrice?.toLocaleString("tr-TR")} ₺</p>
                            <p className="text-sm text-gray-500">Adet: {item.quantity}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Order summary footer */}
                  <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      {order.items?.length || 0} ürün
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-gray-500 mr-2">Toplam:</span>
                      <span className="text-lg font-bold text-[#C9A84C]">{order.total.toLocaleString("tr-TR")} ₺</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 pt-6">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              currentPage === 1
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-white border border-gray-200 text-charcoal hover:bg-gray-50 hover:shadow-sm"
            }`}
          >
            <FiChevronLeft className="w-4 h-4" />
            Önceki
          </button>

          {/* Page Numbers */}
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => goToPage(pageNum)}
                  className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${
                    currentPage === pageNum
                      ? "bg-[#C9A84C] text-white shadow-sm"
                      : "text-gray-500 hover:bg-gray-100"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={!hasMore}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              !hasMore
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-white border border-gray-200 text-charcoal hover:bg-gray-50 hover:shadow-sm"
            }`}
          >
            Sonraki
            <FiChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ─── Delete Confirmation Modal ──────────────────────────────────────── */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !deleting && setDeleteConfirm(null)} />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                <FiAlertCircle className="w-8 h-8 text-red-500" />
              </div>

              <h3 className="text-lg font-playfair font-bold text-charcoal mb-2">
                {deleteConfirm.type === "all" ? "Tüm Siparişleri Sil?" : "Siparişi Sil?"}
              </h3>
              <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                {deleteConfirm.type === "all"
                  ? `${allOrders.length} siparişin tamamı kalıcı olarak silinecektir. Bu işlem geri alınamaz.`
                  : "Bu sipariş kalıcı olarak silinecektir. Bu işlem geri alınamaz."
                }
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  disabled={deleting}
                  className="flex-1 py-3 text-charcoal bg-gray-100 rounded-xl font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  İptal
                </button>
                <button
                  onClick={() => {
                    if (deleteConfirm.type === "all") {
                      handleDeleteAllOrders();
                    } else if (deleteConfirm.orderId) {
                      const order = allOrders.find(o => o.id === deleteConfirm.orderId);
                      handleDeleteOrder(order?.orderId || deleteConfirm.orderId, deleteConfirm.orderId);
                    }
                  }}
                  disabled={deleting}
                  className="flex-1 py-3 text-white bg-red-500 rounded-xl font-medium hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {deleting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Siliniyor...
                    </>
                  ) : (
                    <>
                      <FiTrash2 className="w-4 h-4" />
                      Sil
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
