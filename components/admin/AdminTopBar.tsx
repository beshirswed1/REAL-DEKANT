"use client";

interface AdminTopBarProps {
  adminName: string;
}

export default function AdminTopBar({ adminName }: AdminTopBarProps) {
  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } catch {
      // Continue to redirect even on error
    }
    // Always use hard navigation to re-render the layout correctly
    window.location.href = "/admin/login";
  };

  // Get initials for avatar safely
  const initials = (adminName || "Admin")
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0] || "")
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="admin-topbar">
      <div className="admin-topbar-left" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <span className="admin-topbar-title">Yönetici Paneli</span>
      </div>

      <div className="admin-topbar-right">
        <div className="admin-topbar-user">
          <div className="admin-topbar-avatar">{initials}</div>
          <span className="admin-topbar-name">{adminName}</span>
        </div>

        <button
          onClick={handleLogout}
          className="admin-topbar-logout"
          type="button"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          <span className="admin-logout-text">Çıkış</span>
        </button>
      </div>
    </header>
  );
}
