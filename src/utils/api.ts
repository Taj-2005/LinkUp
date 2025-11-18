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

export async function getCurrentUser() {
  const res = await fetch("/api/protected/me", {
    credentials: "include",
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.error || "Failed to fetch current user");
  }

  return json;
}

export async function getAllUsers() {
  const res = await fetch("/api/protected/users", {
    credentials: "include",
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.error || "Failed to fetch users");
  }

  return json;
}

export async function updateProfile(data: UpdateProfilePayload) {
  const res = await fetch("/api/protected/update-profile", {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.error || json.detail || "Failed to update profile");
  }

  return json;
}
