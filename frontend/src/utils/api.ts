import axios from "axios";
import api from "@/utils/axios"
import Cookies from "js-cookie";

interface SignupData {
  username: string;
  name: string;
  email: string;
  password: string;
  location?: string;
  bio?: string;
}

interface SigninResponse {
  accessToken: string;
  refreshToken: string;
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
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as APIErrorResponse | undefined;
    return data?.error || data?.message || "Request failed";
  }
  if (error instanceof Error) return error.message;
  return "Unknown error occurred";
}

export async function signin(emailOrUsername: string, password: string) {
  try {
    const { data } = await api.post<SigninResponse>("/auth/signin", { emailOrUsername, password });

    Cookies.set("accessToken", data.accessToken, {
      httpOnly: true,
      expires: 1 / 24,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
    });

    Cookies.set("refreshToken", data.refreshToken, {
      httpOnly: true,
      expires: 7, 
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
    });

    return data.user;
  } catch (error: unknown) {
    throw new Error(extractErrorMessage(error) || "Signin failed");
  }
}

export async function signup(data: SignupData) {
  try {
    const res = await api.post("/api/auth/signup", data);
    return res.data;
  } catch (error: unknown) {
    throw new Error(extractErrorMessage(error) || "Signup failed");
  }
}

export async function refreshAccessToken() {
  try {
    const res = await api.post("/api/auth/refresh");
    return res.data;
  } catch (error: unknown) {
    throw new Error("Failed to refresh");
  }
}

export async function signout() {
  try {
    await api.post("/api/auth/signout");
    document.cookie = "accessToken=; path=/; Max-Age=0";
  } catch (error: unknown) {
    console.error(extractErrorMessage(error));
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
  } catch (error: unknown) {
    throw new Error(extractErrorMessage(error) || "Failed to fetch user");
  }
}
