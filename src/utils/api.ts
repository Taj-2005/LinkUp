import {authFetch} from "@/lib/authFetch"

interface SignupData {
  username: string;
  name: string;
  email: string;
  password: string;
  location?: string;
  bio?: string;
  sex: string;
}

interface SigninResponse {
  user: {
    id: string;
    email: string;
    username: string;
  };
}

interface APIErrorResponse {
  error?: string;
  message?: string;
}

function extractErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;

  if (typeof error === "object" && error !== null) {
    const err = error as APIErrorResponse;
    if (err.error || err.message) return err.error || err.message || "Request failed";
  }

  return "Unknown error occurred";
}


export async function signup(data: SignupData) {
  try {
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    });

    let json: any = {};

    try {
      json = await res.json();
    } catch {
      throw new Error("Invalid server response");
    }

    if (!res.ok) {
      throw new Error(json.error || json.message || "Signup failed");
    }

    return json.user;

  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Signup failed";
    throw new Error(message);
  }
}



export async function signin(emailOrUsername: string, password: string) {
  try {
    const res = await fetch("/api/auth/signin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ emailOrUsername, password }),
    });

    let json: any = {};

    try {
      json = await res.json();
    } catch {
      throw new Error("Invalid server response");
    }

    if (!res.ok) {
      throw new Error(json.error || "Login failed");
    }

    return json.user;

  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Signin failed";
    throw new Error(message);
  }
}



export async function refreshAccessToken() {
  try {
    const res = await fetch("/api/auth/refresh", {
      method: "POST",
      credentials: "include",
    });

    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Failed to refresh");

    return json;
  } catch (error: unknown) {
    throw new Error(extractErrorMessage(error));
  }
}


export async function signout() {
  try {
    const res = await fetch("/api/auth/signout", {
      method: "POST",
      credentials: "include",
    });

    let json: any = {};

    try {
      json = await res.json();
    } catch {
      throw new Error("Invalid server response");
    }

    if (!res.ok) {
      throw new Error(json.error || "Signout failed");
    }

    return json;

  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Signout failed";
    throw new Error(message);
  }
}


export function getCurrentUser() {
  return authFetch("/api/me");
}

export function getAllUsers() {
  return authFetch("/api/users");
}
