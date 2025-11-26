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
import { setAuthCookies } from "@/lib/cookies";

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

  if (user.refreshToken !== token) {
    return NextResponse.json(
      { alreadyRefreshed: true },
      { status: 409 }
    );
  }

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

  setAuthCookies(res, newAccessToken, newRefreshToken);

  return res;
}
