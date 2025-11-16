import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { dbConnect } from "@/lib/dbConnect";
import { User } from "@/models/User";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  JWTPayload,
} from "@/lib/tokens";

const isProd = process.env.NODE_ENV === "production";

export async function POST() {
  await dbConnect();

  const cookieStore = await cookies();
  const token = cookieStore.get("refreshToken")?.value;

  if (!token)
    return NextResponse.json({ error: "No refresh token" }, { status: 401 });

  let payload: JWTPayload;
  try {
    payload = verifyRefreshToken(token) as JWTPayload;
  } catch {
    return NextResponse.json({ error: "Invalid refresh token" }, { status: 401 });
  }

  const user = await User.findById(payload.userId);
  if (!user)
    return NextResponse.json({ error: "User not found" }, { status: 401 });

  // 🚨 MAIN FIX — handle token mismatch properly
  if (user.refreshToken !== token) {
    return NextResponse.json(
      { alreadyRefreshed: true },
      { status: 409 } // <-- IMPORTANT
    );
  }

  // Issue new tokens
  const newAccessToken = signAccessToken({
    userId: user._id,
    username: user.username,
  });

  const newRefreshToken = signRefreshToken({
    userId: user._id,
    username: user.username,
  });

  user.refreshToken = newRefreshToken;
  await user.save();

  const res = NextResponse.json({ ok: true });

  res.cookies.set("accessToken", newAccessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
  });

  res.cookies.set("refreshToken", newRefreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
  });

  return res;
}
