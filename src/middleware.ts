import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAccessToken } from "@/lib/tokens";

const PROTECTED_ROUTES = [
  "/livelinks",
  "/linkfinder",
  "/linkhub",
  "/linkupreqs",
  "/linkups",
  "/newlink",
  "/settings",
];

const PUBLIC_ROUTES = ["/", "/signin", "/signup", "/verify-email", "/verification-pending"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const accessToken = req.cookies.get("accessToken")?.value;
  const refreshToken = req.cookies.get("refreshToken")?.value;

  if (PUBLIC_ROUTES.includes(pathname)) {
    if ((accessToken || refreshToken) && pathname !== "/verify-email" && pathname !== "/verification-pending") {
      if (accessToken) {
        try {
          verifyAccessToken(accessToken);
          const url = req.nextUrl.clone();
          url.pathname = "/livelinks";
          return NextResponse.redirect(url);
        } catch {
        }
      }
    }
    return NextResponse.next();
  }

  const isProtected = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtected && !accessToken && !refreshToken) {
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
    "/livelinks/:path*",
    "/linkfinder/:path*",
    "/linkhub/:path*",
    "/linkupreqs/:path*",
    "/linkups/:path*",
    "/newlink/:path*",
    "/settings/:path*",
  ],
};

