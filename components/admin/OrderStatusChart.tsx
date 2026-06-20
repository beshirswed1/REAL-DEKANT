import type { OrderStatus } from "@/types";

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Bekliyor",
  confirmed: "Onaylandı",
  shipped: "Kargoda",
  delivered: "Teslim Edildi",
  cancelled: "İptal",
};

interface OrderStatusChartProps {
  statusCounts: Record<OrderStatus, number>;
}

export default function OrderStatusChart({ statusCounts }: OrderStatusChartProps) {
  const total = Object.values(statusCounts).reduce((a, b) => a + b, 0);
  const statuses: OrderStatus[] = ["pending", "confirmed", "shipped", "delivered", "cancelled"];

  if (total === 0) {
    return (
      <div className="admin-empty">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="10" />
          <path d="M8 12h8" />
        </svg>
        <p>Henüz sipariş bulunmuyor</p>
      </div>
    );
  }

  return (
    <div className="admin-status-chart">
      {statuses.map((status) => {
        const count = statusCounts[status] || 0;
        const percentage = total > 0 ? (count / total) * 100 : 0;

        return (
          <div key={status} className="admin-status-row">
            <span className="admin-status-label">
              {STATUS_LABELS[status]}
            </span>
            <div className="admin-status-bar-track">
              <div
                className={`admin-status-bar-fill ${status}`}
                style={{ width: `${Math.max(percentage, count > 0 ? 8 : 0)}%` }}
              >
                {count > 0 && (
                  <span className="admin-status-bar-count">{count}</span>
                )}
              </div>
            </div>
            <span className="admin-status-total">{count}</span>
          </div>
        );
      })}
    </div>
  );
}
