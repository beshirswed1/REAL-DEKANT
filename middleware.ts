import { NextResponse, type NextRequest } from "next/server";

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ─── Admin route protection ────────────────────────────────────────────────
  const isAdminRoute = pathname.startsWith("/admin");
  const isAdminLogin = pathname === "/admin/login";

  if (isAdminRoute && !isAdminLogin) {
    const hasAdminCookie = req.cookies.has("rd_admin");
    if (!hasAdminCookie) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      return NextResponse.redirect(url);
    }
  }

  // ─── Customer account protection ──────────────────────────────────────────
  const isAccountRoute = pathname.startsWith('/account');

  if (isAccountRoute) {
    const hasAuth = req.cookies.has("rd_auth");
    if (!hasAuth) {
      const url = req.nextUrl.clone();
      url.pathname = "/";
      url.searchParams.set("login", "true");
      return NextResponse.redirect(url);
    }
  }

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-pathname", pathname);
  requestHeaders.set("x-url", req.url);
  
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  // Match all pathnames except those starting with api, _next, or having file extensions
  matcher: ["/((?!api|_next|_vercel|[\\w-]+\\.\\w+).*)"],
};
