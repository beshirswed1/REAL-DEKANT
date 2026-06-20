"use client";

import { useState, useEffect } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminTopBar from "./AdminTopBar";

interface AdminShellProps {
  children: React.ReactNode;
  adminName: string;
}

export default function AdminShell({ children, adminName }: AdminShellProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("rd_admin_sidebar_collapsed");
    if (stored === "true") {
      setIsCollapsed(true);
    }
  }, []);

  const toggleSidebar = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("rd_admin_sidebar_collapsed", String(next));
      return next;
    });
  };

  return (
    <div className={`admin-shell ${isCollapsed ? "sidebar-collapsed" : ""}`}>
      <AdminSidebar isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} />
      <div className="admin-main-wrapper">
        <AdminTopBar 
          adminName={adminName} 
        />
        <main className="admin-content">{children}</main>
      </div>
    </div>
  );
}
