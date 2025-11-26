import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAccessToken, verifyRefreshToken } from "@/lib/tokens";

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

function isTokenValid(token: string | undefined, verifyFn: (token: string) => unknown): boolean {
  if (!token) return false;
  try {
    verifyFn(token);
    return true;
  } catch {
    return false;
  }
}

function isAuthenticated(accessToken: string | undefined, refreshToken: string | undefined): boolean {
  if (isTokenValid(accessToken, verifyAccessToken)) {
    return true;
  }
  if (isTokenValid(refreshToken, verifyRefreshToken)) {
    return true;
  }
  return false;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const accessToken = req.cookies.get("accessToken")?.value;
  const refreshToken = req.cookies.get("refreshToken")?.value;

  const authenticated = isAuthenticated(accessToken, refreshToken);

  if (PUBLIC_ROUTES.includes(pathname)) {
    if (authenticated && pathname !== "/verify-email" && pathname !== "/verification-pending") {
      const url = req.nextUrl.clone();
      url.pathname = "/livelinks";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  const isProtected = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtected && !authenticated) {
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

