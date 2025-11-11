import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_ROUTES = [
  "/livelinks",
  "/linkfinder",
  "/linkhub",
  "/linkupreqs",
  "/linkups",
  "/newlink",
];

const PUBLIC_ROUTES = ["/", "/signin", "/signup"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/static") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  const token = req.cookies.get("accessToken")?.value;

  if (PUBLIC_ROUTES.includes(pathname) && token) {
    const url = req.nextUrl.clone();
    url.pathname = "/livelinks";
    return NextResponse.redirect(url);
  }

  const isProtected = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtected && !token) {
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
    "/livelinks/:path*",
    "/linkfinder/:path*",
    "/linkhub/:path*",
    "/linkupreqs/:path*",
    "/linkups/:path*",
    "/newlink/:path*",
  ],
};
