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
  response.cookies.set("accessToken", token, {
    ...getCookieOptions(COOKIE_CONFIG.ACCESS_TOKEN_MAX_AGE),
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

  response.cookies.set("refreshToken", "", {
    ...baseOptions,
    expires: expiredDate,
    maxAge: 0,
  });
}