import { cookies } from "next/headers";
import { verifyAccessToken } from "@/lib/tokens";
import { User } from "@/models/User";

export async function requireAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  if (!token) throw new Error("Access token missing");

  try {
    const payload = verifyAccessToken(token) as {
      userId: string;
      username: string;
    };

    const user = await User.findById(payload.userId).select("-password -__v");
    if (!user) throw new Error("User not found");

    return user;
  } catch {
    throw new Error("Invalid or expired access token");
  }
}
