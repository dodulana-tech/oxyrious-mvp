import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
    cookieName: process.env.NODE_ENV === "production"
      ? "__Secure-authjs.session-token"
      : "authjs.session-token",
  });
  const { pathname } = request.nextUrl;

  // Allow public routes and static assets
  if (
    pathname === "/" ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/about") ||
    pathname.startsWith("/contact") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/wallet/webhook") ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  // Redirect unauthenticated users to login
  if (!token) {
    // API routes get 401, pages get redirected
    if (pathname.startsWith("/api")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const role = token.role as string | undefined;

  // Hospital portal: require HOSPITAL role
  if (pathname.startsWith("/portal") || pathname.startsWith("/api/hospital/")) {
    if (role !== "HOSPITAL") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  // Admin pages: require ADMIN or STAFF role
  const adminPages = ["/dashboard", "/orders", "/hospitals", "/inventory", "/logistics", "/receivables", "/growth", "/referrals", "/reports"];
  if (adminPages.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    if (role !== "ADMIN" && role !== "STAFF") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  // All other routes (including /api/*) — allow any authenticated user
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
