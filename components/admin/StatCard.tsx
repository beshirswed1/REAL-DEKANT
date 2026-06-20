import type { ReactNode } from "react";

interface StatCardProps {
  icon: ReactNode;
  iconColor: "gold" | "green" | "amber" | "red";
  value: string | number;
  label: string;
}

export default function StatCard({ icon, iconColor, value, label }: StatCardProps) {
  return (
    <div className="admin-stat-card">
      <div className="admin-stat-header">
        <div className={`admin-stat-icon ${iconColor}`}>{icon}</div>
      </div>
      <div className="admin-stat-value">{value}</div>
      <div className="admin-stat-label">{label}</div>
    </div>
  );
}
