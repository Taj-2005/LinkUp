import { verifyAccessToken } from "@/lib/tokens";
import type { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";

export interface AuthPayload {
  userId: string;
  username: string;
}

export function requireAuth(cookieStore: ReadonlyRequestCookies): AuthPayload {     
  const token = cookieStore.get("accessToken")?.value || cookieStore.get("accessTokenReadable")?.value;

  if (!token) {
    throw new Error("Unauthorized: No access token found");
  }

  try {
    return verifyAccessToken(token) as AuthPayload;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Token verification failed";
    throw new Error(`Unauthorized: ${errorMessage}`);
  }
}
