import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED = [
  "/livelinks",
  "/linkfinder",
  "/linkhub",
  "/linkupreqs",
  "/linkups",
  "/newlink"
];

export function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const token = req.cookies.get("accessToken")?.value;

  // Block logged-in from /signin & /signup
  if (path.startsWith("/signin") || path.startsWith("/signup") || path === "/") {
    if (token) {
      const url = req.nextUrl.clone();
      url.pathname = "/livelinks";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // Protect auth pages
  const needsAuth = PROTECTED.some(route => path.startsWith(route));

  if (needsAuth && !token) {
    const url = req.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/livelinks/:path*",
    "/signin",
    "/signup",
    "/linkfinder/:path*",
    "/linkhub/:path*",
    "/linkupreqs/:path*",
    "/linkups/:path*",
    "/newlink/:path*",
  ],
};
