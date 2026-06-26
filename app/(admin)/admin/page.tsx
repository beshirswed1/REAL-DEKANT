/* eslint-disable @typescript-eslint/no-explicit-any */
import { adminDb } from "@/lib/firebase-admin";
import type { OrderStatus } from "@/types";
import StatCard from "@/components/admin/StatCard";
import StatusBadge from "@/components/admin/StatusBadge";
import OrderStatusChart from "@/components/admin/OrderStatusChart";
import Link from "next/link";

// ─── Firestore Timestamp helper ──────────────────────────────────────────────
function toDate(ts: FirebaseFirestore.Timestamp | { _seconds: number; _nanoseconds: number } | undefined): Date {
  if (!ts) return new Date(0);
  if ('toDate' in ts && typeof ts.toDate === 'function') return ts.toDate();
  if ('_seconds' in ts) return new Date(ts._seconds * 1000);
  return new Date(0);
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// ─── Data fetching — REAL Firestore only, NO fake data ───────────────────────
async function getDashboardData() {
  const now = new Date();

  // Today start (midnight local time)
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Month start
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  // ──── Fetch all orders once — filter in-memory to avoid composite indexes ────
  const allOrdersSnap = await adminDb.collection("orders").limit(500).get();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const allOrdersRaw: any[] = allOrdersSnap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));

  // Deduplicate by orderId
  const seenIds = new Set<string>();
  const allOrders = allOrdersRaw.filter((o) => {
    const key = o.orderId || o.id;
    if (seenIds.has(key)) return false;
    seenIds.add(key);
    return true;
  });

  const tsToDate = (ts: any): Date | null => {
    if (!ts) return null;
    if (typeof ts.toDate === "function") return ts.toDate();
    if (ts._seconds) return new Date(ts._seconds * 1000);
    return null;
  };

  // ──── 1. Today's orders ────
  const todayOrdersCount = allOrders.filter((o) => {
    const d = tsToDate(o.createdAt);
    return d && d >= todayStart;
  }).length;

  // ──── 2. Monthly revenue (paid orders this month) ────
  const monthlyRevenue = allOrders
    .filter((o) => {
      const d = tsToDate(o.createdAt);
      return o.paymentStatus === "paid" && d && d >= monthStart;
    })
    .reduce((sum: number, o) => sum + (o.total || 0), 0);

  // ──── 3. Pending orders ────
  const pendingOrdersCount = allOrders.filter((o) => o.orderStatus === "pending").length;

  // ──── 4. Orders by status (for chart) ────
  const statusCounts: Record<OrderStatus, number> = { pending: 0, confirmed: 0, shipped: 0, delivered: 0, cancelled: 0 };
  allOrders.forEach((o) => {
    const status = o.orderStatus as OrderStatus;
    if (status in statusCounts) statusCounts[status]++;
  });

  // ──── 5. Recent orders (last 10 sorted in-memory) ────
  const recentOrders = allOrders
    .map((o) => ({
      id: o.id,
      orderId: o.orderId || o.id.slice(0, 8).toUpperCase(),
      customerName: o.customer?.name || "Bilinmiyor",
      total: o.total || 0,
      orderStatus: (o.orderStatus || "pending") as OrderStatus,
      createdAt: toDate(o.createdAt),
    }))
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 10);

  // ──── Fetch all products once ────
  const allProductsSnap = await adminDb.collection("products").get();

  // ──── 6. Low stock published products ────
  const lowStockCount = allProductsSnap.docs.filter((doc: any) => {
    const d = doc.data();
    return d.isPublished === true && (d.stock ?? 999) <= 5;
  }).length;

  // ──── 7. Top 5 selling products ────
  const topProducts = allProductsSnap.docs
    .map((doc: any) => {
      const data = doc.data();
      const firstImage = data.images?.[0];
      const imageUrl = typeof firstImage === "string" ? firstImage : firstImage?.url || "";
      return { id: doc.id, perfumeName: data.perfumeName || "—", brand: data.brand || "—", soldCount: data.soldCount || 0, image: imageUrl };
    })
    .sort((a, b) => b.soldCount - a.soldCount)
    .slice(0, 5);

  return {
    todayOrdersCount,
    monthlyRevenue,
    pendingOrdersCount,
    lowStockCount,
    recentOrders,
    topProducts,
    statusCounts,
  };
}

// ─── Icons ────────────────────────────────────────────────────────────────────
const TodayIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const RevenueIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
  </svg>
);

const PendingIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const StockIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function AdminDashboardPage() {
  const data = await getDashboardData();

  return (
    <>
      {/* Header */}
      <div className="admin-dashboard-header">
        <h1 className="admin-dashboard-title">Dashboard</h1>
        <p className="admin-dashboard-subtitle">
          Genel bakış ve güncel istatistikler
        </p>
      </div>

      {/* ─── Stat Cards ─────────────────────────────────────────────────── */}
      <div className="admin-stats-grid">
        <StatCard
          icon={TodayIcon}
          iconColor="gold"
          value={data.todayOrdersCount}
          label="Bugünkü Siparişler"
        />
        <StatCard
          icon={RevenueIcon}
          iconColor="green"
          value={formatCurrency(data.monthlyRevenue)}
          label="Bu Ayki Gelir"
        />
        <StatCard
          icon={PendingIcon}
          iconColor="amber"
          value={data.pendingOrdersCount}
          label="Bekleyen Siparişler"
        />
        <StatCard
          icon={StockIcon}
          iconColor="red"
          value={data.lowStockCount}
          label="Düşük Stok"
        />
      </div>

      {/* ─── Main Grid ──────────────────────────────────────────────────── */}
      <div className="admin-dashboard-grid">
        {/* Recent Orders */}
        <div className="admin-panel admin-dashboard-grid-full">
          <div className="admin-panel-header">
            <h2 className="admin-panel-title">Son Siparişler</h2>
          </div>
          <div className="admin-panel-body">
            {data.recentOrders.length === 0 ? (
              <div className="admin-empty">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 01-8 0" />
                </svg>
                <p>Henüz sipariş bulunmuyor</p>
              </div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Sipariş ID</th>
                    <th className="hidden md:table-cell">Müşteri</th>
                    <th>Tutar</th>
                    <th>Durum</th>
                    <th className="hidden md:table-cell">Tarih</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentOrders.map((order: any) => (
                    <tr key={order.id}>
                      <td style={{ fontWeight: 600, fontFamily: "monospace", fontSize: 13 }}>
                        {order.orderId}
                        <div className="md:hidden text-xs text-gray-500 font-sans font-normal mt-1">
                          {order.customerName} • {formatDate(order.createdAt)}
                        </div>
                      </td>
                      <td className="hidden md:table-cell">{order.customerName}</td>
                      <td className="admin-currency" style={{ fontWeight: 600 }}>
                        {formatCurrency(order.total)}
                      </td>
                      <td>
                        <StatusBadge status={order.orderStatus} />
                      </td>
                      <td className="hidden md:table-cell" style={{ color: "#888", fontSize: 13 }}>
                        {formatDate(order.createdAt)}
                      </td>
                      <td>
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="admin-btn-view"
                        >
                          Görüntüle
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Top 5 Products */}
        <div className="admin-panel">
          <div className="admin-panel-header">
            <h2 className="admin-panel-title">En Çok Satılanlar</h2>
          </div>
          <div className="admin-panel-body">
            {data.topProducts.length === 0 ? (
              <div className="admin-empty">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
                  <line x1="7" y1="7" x2="7.01" y2="7" />
                </svg>
                <p>Henüz ürün bulunmuyor</p>
              </div>
            ) : (
              data.topProducts.map((product: any, index: number) => {
                const rankClass =
                  index === 0
                    ? "rank-1"
                    : index === 1
                    ? "rank-2"
                    : index === 2
                    ? "rank-3"
                    : "rank-other";

                return (
                  <div key={product.id} className="admin-top-product">
                    <div className={`admin-top-product-rank ${rankClass}`}>
                      {index + 1}
                    </div>
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.perfumeName}
                        className="admin-top-product-img"
                        width={44}
                        height={44}
                      />
                    ) : (
                      <div
                        className="admin-top-product-img"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 16,
                        }}
                      >
                        🧴
                      </div>
                    )}
                    <div className="admin-top-product-info">
                      <div className="admin-top-product-name">
                        {product.perfumeName}
                      </div>
                      <div className="admin-top-product-brand">
                        {product.brand}
                      </div>
                    </div>
                    <div className="admin-top-product-sold">
                      {product.soldCount}
                      <span className="admin-top-product-sold-label">satış</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Orders by Status Chart */}
        <div className="admin-panel">
          <div className="admin-panel-header">
            <h2 className="admin-panel-title">Sipariş Durumları</h2>
          </div>
          <div className="admin-panel-body">
            <OrderStatusChart statusCounts={data.statusCounts} />
          </div>
        </div>
      </div>
    </>
  );
}
