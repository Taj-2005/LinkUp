interface SignupData {
  username: string;
  name: string;
  email: string;
  password: string;
  location?: string;
  bio?: string;
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

    const json = await res.json();
    if (!res.ok) throw new Error(json.error || json.message || "Signup failed");

    return json;
  } catch (error: unknown) {
    throw new Error(extractErrorMessage(error));
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

    const json: SigninResponse = await res.json();

    if (!res.ok) {
      const message =
        typeof json === "object" && json !== null && "error" in json
          ? (json.error as string)
          : "Request failed";
      throw new Error(message);
    }

    return json.user;
  } catch (error: unknown) {
    throw new Error(extractErrorMessage(error) || "Signin failed");
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
    await fetch("/api/auth/signout", {
      method: "POST",
      credentials: "include",
    });

    window.location.href = "/";
  } catch (err) {
    console.error("Signout failed:", err);
  }
}

export async function getCurrentUser() {
  try {
    let res = await fetch("/api/me", { credentials: "include" });

    if (res.status === 401) {
      const refreshed = await refreshAccessToken().catch(() => null);
      if (!refreshed) {
        throw new Error("Not authenticated");
      }
      res = await fetch("/api/me", { credentials: "include" });
    }

    const json = await res.json();
    if (!res.ok){
      await signout()
      throw new Error(json.error || "Failed to fetch user");
    }

    return json;
  } catch (error: unknown) {
    await signout()
    throw new Error(extractErrorMessage(error));
  }
}
