import axios from "axios";

const API_URL =
  process.env.NODE_ENV === "production"
    ? process.env.NEXT_PUBLIC_API_URL
    : process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:6969";

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

interface SignupData {
  username: string;
  name: string;
  email: string;
  password: string;
  location?: string;
  bio?: string;
}

export async function signin(emailOrUsername: string, password: string) {
  try {
    const { data } = await api.post("/api/auth/signin", { emailOrUsername, password });
    return data;
  } catch (err: any) {
    console.error("Signin error:", err.response?.data || err.message);
    throw new Error(err.response?.data?.error || "Signin failed");
  }
}

export async function signup(data: SignupData) {
  try {
    const res = await api.post("/api/auth/signup", data);
    return res.data;
  } catch (err: any) {
    console.error("Signup error:", err.response?.data || err.message);
    throw new Error(err.response?.data?.error || "Signup failed");
  }
}

export async function refreshAccessToken() {
  try {
    const res = await api.post("/api/auth/refresh");
    return res.data;
  } catch (err: any) {
    console.error("Refresh token error:", err.response?.data || err.message);
    throw new Error("Failed to refresh");
  }
}

export async function signout() {
  try {
    await api.post("/api/auth/signout");
    document.cookie = "accessToken=; path=/; Max-Age=0";
  } catch (err: any) {
    console.error("Signout error:", err.response?.data || err.message);
  }
}

export async function getCurrentUser() {
  try {
    let res = await api.get("/api/me");

    if (res.status === 401) {
      const refreshed = await refreshAccessToken().catch(() => null);
      if (!refreshed) throw new Error("Not authenticated");
      res = await api.get("/api/me");
    }

    return res.data;
  } catch (err: any) {
    console.error("Get current user error:", err.response?.data || err.message);
    throw new Error(err.response?.data?.error || "Failed to fetch user");
  }
}
