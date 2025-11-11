import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { dbConnect } from "@/lib/dbConnect";
import { User } from "@/models/User";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "@/lib/tokens";

export async function POST(_req: Request) {
  try {
    await dbConnect();

    const cookieStore = await cookies();
    const token = cookieStore.get("refreshToken")?.value;

    if (!token) return NextResponse.json({ error: "No refresh token" }, { status: 401 });

    let payload: any;
    try {
      payload = verifyRefreshToken(token);
    } catch {
      return NextResponse.json({ error: "Invalid refresh token" }, { status: 401 });
    }

    const user = await User.findById(payload.userId);
    if (!user || user.refreshToken !== token)
      return NextResponse.json({ error: "Invalid refresh token" }, { status: 401 });

    const newAccessToken = signAccessToken({ userId: user._id, username: user.username });
    const newRefreshToken = signRefreshToken({ userId: user._id, username: user.username });

    user.refreshToken = newRefreshToken;
    await user.save();

    const res = NextResponse.json({ ok: true });

    res.cookies.set("accessToken", newAccessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
    });
    res.cookies.set("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
    });

    return res;
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
