import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED = [
  "/livelinks",
  "/linkfinder",
  "/linkhub",
  "/linkupreqs",
  "/linkups",
  "/newlink",
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("accessToken")?.value;

  const publicRoutes = ["/", "/signin", "/signup"];
  const isPublic = publicRoutes.includes(pathname);

  if (isPublic && token) {
    const url = req.nextUrl.clone();
    url.pathname = "/livelinks";
    return NextResponse.redirect(url);
  }

  const isProtected = PROTECTED.some(route => pathname.startsWith(route));

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