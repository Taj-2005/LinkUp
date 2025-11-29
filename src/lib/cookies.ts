import { NextResponse } from "next/server";

export const COOKIE_CONFIG = {
  ACCESS_TOKEN_MAX_AGE: 60 * 60,
  REFRESH_TOKEN_MAX_AGE: 60 * 60 * 24 * 7,
} as const;

function getCookieOptions(maxAge: number) {
  const isProd = process.env.NODE_ENV === "production";

  const expires = new Date();
  expires.setTime(expires.getTime() + maxAge * 1000);

  return {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax" as const,
    path: "/",
    maxAge,
    expires,
  };
}

export function setAccessTokenCookie(response: NextResponse, token: string): void {
  const isProd = process.env.NODE_ENV === "production";
  const expires = new Date();
  expires.setTime(expires.getTime() + COOKIE_CONFIG.ACCESS_TOKEN_MAX_AGE * 1000);

  // Set HttpOnly cookie for Next.js API routes
  response.cookies.set("accessToken", token, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax" as const,
    path: "/",
    maxAge: COOKIE_CONFIG.ACCESS_TOKEN_MAX_AGE,
    expires,
  });

  // Also set a readable cookie for standalone backend (non-HttpOnly)
  // This allows JavaScript to read it for the Socket.IO server
  response.cookies.set("accessTokenReadable", token, {
    httpOnly: false, // Allow JavaScript to read
    secure: isProd,
    sameSite: "lax" as const,
    path: "/",
    maxAge: COOKIE_CONFIG.ACCESS_TOKEN_MAX_AGE,
    expires,
  });
}

export function setRefreshTokenCookie(response: NextResponse, token: string): void {
  response.cookies.set("refreshToken", token, {
    ...getCookieOptions(COOKIE_CONFIG.REFRESH_TOKEN_MAX_AGE),
  });
}

export function setAuthCookies(
  response: NextResponse,
  accessToken: string,
  refreshToken: string
): void {
  setAccessTokenCookie(response, accessToken);
  setRefreshTokenCookie(response, refreshToken);
}

export function deleteAuthCookies(response: NextResponse): void {
  const isProd = process.env.NODE_ENV === "production";
  const baseOptions = {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax" as const,
    path: "/",
  };

  const expiredDate = new Date(0);

  response.cookies.set("accessToken", "", {
    ...baseOptions,
    expires: expiredDate,
    maxAge: 0,
  });

  // Also delete readable cookie
  response.cookies.set("accessTokenReadable", "", {
    httpOnly: false,
    secure: isProd,
    sameSite: "lax" as const,
    path: "/",
    expires: expiredDate,
    maxAge: 0,
  });

  response.cookies.set("refreshToken", "", {
    ...baseOptions,
    expires: expiredDate,
    maxAge: 0,
  });
}