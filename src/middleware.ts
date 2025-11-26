import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_ROUTES = [
  "/livelinks",
  "/linkfinder",
  "/linkhub",
  "/linkupreqs",
  "/linkups",
  "/newlink",
  "/settings",
];

const PUBLIC_ROUTES = ["/", "/signin", "/signup", "/verify-email", "/verification-pending", "/forgot-password", "/reset-password"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const refreshToken = req.cookies.get("refreshToken")?.value;
  const hasRefreshToken = !!refreshToken;

  if (PUBLIC_ROUTES.includes(pathname)) {
    if (hasRefreshToken && pathname !== "/verify-email" && pathname !== "/verification-pending") {
      const url = req.nextUrl.clone();
      url.pathname = "/livelinks";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  const isProtected = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtected && !hasRefreshToken) {
    const url = req.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/signin",
    "/signup",
    "/verify-email",
    "/verification-pending",
    "/forgot-password",
    "/reset-password",
    "/livelinks/:path*",
    "/linkfinder/:path*",
    "/linkhub/:path*",
    "/linkupreqs/:path*",
    "/linkups/:path*",
    "/newlink/:path*",
    "/settings/:path*",
  ],
};

