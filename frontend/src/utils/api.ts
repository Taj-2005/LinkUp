const API_URL = process.env.NEXT_PUBLIC_API_URL!;

export async function signin(emailOrUsername: string, password: string) {
  const res = await fetch(`${API_URL}/api/auth/signin`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ emailOrUsername, password })
  });

  if (!res.ok) throw new Error("Signin failed");

  return await res.json();
}

export async function signup(data: Object) {
  const res = await fetch(`${API_URL}/api/auth/signup`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  if (!res.ok) throw new Error("Signup failed");

  return await res.json();
}

export async function refreshAccessToken() {
  const res = await fetch(`${API_URL}/api/auth/refresh`, {
    method: "POST",
    credentials: "include",
  });

  if (!res.ok) throw new Error("Failed to refresh");

  return await res.json();
}

export async function signout() {
  await fetch(`${API_URL}/api/auth/signout`, {
    method: "POST",
    credentials: "include",
  });

  document.cookie = "accessToken=; path=/; Max-Age=0";
}

export async function getCurrentUser() {
  let res = await fetch(`${API_URL}/api/me`, {
    method: "GET",
    credentials: "include",
  });

  if (res.status === 401) {
    const refreshed = await refreshAccessToken().catch(() => null);

    if (!refreshed) throw new Error("Not authenticated");

    res = await fetch(`${API_URL}/api/auth/me`, {
      method: "GET",
      credentials: "include",
    });
  }

  if (!res.ok) throw new Error("Failed to fetch user");

  return await res.json();
}