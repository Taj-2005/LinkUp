import { verifyAccessToken } from "@/lib/tokens";
import type { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";

export interface AuthPayload {
  userId: string;
  username: string;
}

export function requireAuth(cookieStore: ReadonlyRequestCookies): AuthPayload {
  const token = cookieStore.get("accessToken")?.value;

  if (!token) {
    throw new Error("Unauthorized");
  }

  try {
    return verifyAccessToken(token) as AuthPayload;
  } catch {
    throw new Error("Unauthorized");
  }
}
