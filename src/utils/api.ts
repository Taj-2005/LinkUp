import { authFetch } from "@/lib/authFetch";
import { IUser } from "@/models/User";
import { ILink } from "@/models/Link";

export interface MeResponse {
  user: IUser;
}

export interface SignupData {
  username: string;
  name: string;
  email: string;
  password: string;
  location?: string;
  bio?: string;
  sex: string;
}

export interface UserResponse {
  id: string;
  email: string;
  username: string;
}

export interface APIErrorResponse {
  error?: string;
  message?: string;
}

export interface APIJson<T> {
  user?: T;
  ok?: boolean;
  message?: string;
  error?: string;
}

type UpdateProfilePayload = Partial<{
  username: string;
  name: string;
  bio: string;
  location: string;
  user_avatar: string;
  sex: "male" | "female" | "other";
  accountPrivacy: "public" | "private";
}>;

function extractErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;

  if (typeof error === "object" && error !== null) {
    const err = error as APIErrorResponse;
    if (err.error) return err.error;
    if (err.message) return err.message;
  }

  return "Unknown error occurred";
}

export async function signup(data: SignupData): Promise<UserResponse> {
  try {
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    });

    const json: APIJson<UserResponse> = await res.json();

    if (!res.ok) {
      throw new Error(json.error || json.message || "Signup failed");
    }

    if (!json.user) {
      throw new Error("Invalid signup response");
    }

    return json.user;
  } catch (err: unknown) {
    throw new Error(extractErrorMessage(err));
  }
}

export async function signin(
  emailOrUsername: string,
  password: string
): Promise<UserResponse> {
  try {
    const res = await fetch("/api/auth/signin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ emailOrUsername, password }),
    });

    const json: APIJson<UserResponse> = await res.json();

    if (!res.ok) {
      throw new Error(json.error || json.message || "Login failed");
    }

    if (!json.user) {
      throw new Error("Invalid signin response");
    }

    return json.user;
  } catch (err: unknown) {
    throw new Error(extractErrorMessage(err));
  }
}

export async function refreshAccessToken(): Promise<APIJson<null>> {
  try {
    const res = await fetch("/api/auth/refresh", {
      method: "POST",
      credentials: "include",
    });

    const json: APIJson<null> = await res.json();

    if (!res.ok) throw new Error(json.error || "Failed to refresh");

    return json;
  } catch (error: unknown) {
    throw new Error(extractErrorMessage(error));
  }
}

export async function signout(): Promise<APIJson<null>> {
  try {
    const res = await fetch("/api/auth/signout", {
      method: "POST",
      credentials: "include",
    });

    const json: APIJson<null> = await res.json();

    if (!res.ok) {
      throw new Error(json.error || "Signout failed");
    }

    return json;
  } catch (err: unknown) {
    throw new Error(extractErrorMessage(err));
  }
}

export function getCurrentUser(): Promise<{ user: IUser }> {
  return authFetch("/api/protected/me") as Promise<{ user: IUser }>;
}

export function getAllUsers(): Promise<IUser[]> {
  return authFetch("/api/protected/users") as Promise<IUser[]>;
}

export async function updateProfile(data: UpdateProfilePayload): Promise<{ success: boolean; user: IUser }> {
  return authFetch("/api/protected/update-profile", {
    method: "PATCH",
    body: JSON.stringify(data),
  }) as Promise<{ success: boolean; user: IUser }>;
}

export async function getUser(identifier: string) {
  try {
  const res = await fetch("/api/auth/get-user", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identifier }),
  });

  const json = await res.json();

    if (!res.ok) {

      if (res.status === 404) {
        return null;
      }
      throw new Error(json.error || "Failed to get user");
    }

  return json.user;
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
}

export interface SuggestionsResponse {
  users: IUser[];
}

export interface PaginatedUsersResponse {
  users: IUser[];
  nextCursor: string | null;
}

export function getSuggestions(): Promise<SuggestionsResponse> {
  return authFetch("/api/protected/users/suggestions") as Promise<SuggestionsResponse>;
}

export function getSuggestionsAll(cursor: string | null): Promise<PaginatedUsersResponse> {
  const url = cursor
    ? `/api/protected/users/suggestions/all?cursor=${encodeURIComponent(cursor)}`
    : "/api/protected/users/suggestions/all";
  return authFetch(url) as Promise<PaginatedUsersResponse>;
}

export function searchUsers(query: string, cursor: string | null): Promise<PaginatedUsersResponse> {
  const params = new URLSearchParams({ q: query });
  if (cursor) {
    params.append("cursor", cursor);
  }
  return authFetch(`/api/protected/users/search?${params.toString()}`) as Promise<PaginatedUsersResponse>;
}

export interface PaginatedLinksResponse {
  links: ILink[];
  nextCursor: string | null;
}

export function getFeedLinks(cursor: string | null): Promise<PaginatedLinksResponse> {
  const url = cursor
    ? `/api/links/feed?cursor=${encodeURIComponent(cursor)}`
    : "/api/links/feed";
  return authFetch(url) as Promise<PaginatedLinksResponse>;
}

export function getStories(cursor: string | null): Promise<PaginatedUsersResponse> {
  const url = cursor
    ? `/api/protected/users/stories?cursor=${encodeURIComponent(cursor)}`
    : "/api/protected/users/stories";
  return authFetch(url) as Promise<PaginatedUsersResponse>;
}
