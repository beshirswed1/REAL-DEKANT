import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { adminAuth } from "@/lib/firebase-admin";
import AdminShell from "@/components/admin/AdminShell";
import { Playfair_Display, Inter } from "next/font/google";
import "./admin.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["600", "700"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata = {
  title: "Yönetim Paneli | Real Dekant",
  description: "Real Dekant yönetim paneli — ürünler, siparişler, kuponlar ve ayarlar.",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // ─── Bypass auth for login page ────────────────────────────────────────
  const headersList = await headers();
  
  // Try multiple sources for pathname (x-pathname from our middleware, 
  // x-invoke-path from Next.js internals, or parse from x-url)
  let pathname = headersList.get("x-pathname") || "";
  if (!pathname) {
    pathname = headersList.get("x-invoke-path") || "";
  }
  if (!pathname) {
    try {
      const urlStr = headersList.get("x-url") || headersList.get("x-forwarded-url") || "";
      if (urlStr) {
        pathname = new URL(urlStr).pathname;
      }
    } catch {}
  }
  const isLoginPage = pathname === "/admin/login";

  let adminName = "Admin";

  if (!isLoginPage) {
    // ─── Verify admin token from cookie ─────────────────────────────────────
    const cookieStore = await cookies();
    const token = cookieStore.get("rd_admin")?.value;

    if (!token) {
      redirect("/admin/login");
    }

    try {
      const decoded = await adminAuth.verifySessionCookie(token, true);

      // Must have admin claim
      if (!decoded.admin) {
        redirect("/admin/login");
      }

      // Get display name
      const user = await adminAuth.getUser(decoded.uid);
      adminName = user.displayName || user.email?.split("@")[0] || "Admin";
    } catch {
      // Token expired or invalid
      redirect("/admin/login");
    }
  }

  return (
    <div className={`${playfair.variable} ${inter.variable} admin-root-layout`} style={{ margin: 0, minHeight: "100vh" }}>
      {isLoginPage ? (
        children
      ) : (
        <AdminShell adminName={adminName}>{children}</AdminShell>
      )}
    </div>
  );
}
