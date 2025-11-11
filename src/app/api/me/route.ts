import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { dbConnect } from "@/lib/dbConnect";
import { User, IUser } from "@/models/User";
import { requireAuth } from "@/lib/auth";
import {
  verifyRefreshToken,
  signAccessToken,
  signRefreshToken,
} from "@/lib/tokens";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  await dbConnect();

  try {
    const user = await requireAuth();
    return NextResponse.json({ message: "Protected data", user });
  } catch (err: unknown) {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("refreshToken")?.value;

    if (!refreshToken) {
      const res = NextResponse.json(
        { error: "Not authenticated: refresh token missing" },
        { status: 401 }
      );
      res.cookies.delete("accessToken");
      res.cookies.delete("refreshToken");
      return res;
    }

    try {
      const payload = verifyRefreshToken(refreshToken) as {
        userId: string;
        username: string;
      };

      const user = await User.findById(payload.userId).select("-password -__v");
      if (!user) {
        const res = NextResponse.json({ error: "User not found" }, { status: 401 });
        res.cookies.delete("accessToken");
        res.cookies.delete("refreshToken");
        return res;
      }

      if (user.refreshToken !== refreshToken) {
        const res = NextResponse.json({ error: "Invalid refresh token" }, { status: 401 });
        res.cookies.delete("accessToken");
        res.cookies.delete("refreshToken");
        return res;
      }

      const newAccessToken = signAccessToken({ userId: user._id, username: user.username });
      const newRefreshToken = signRefreshToken({ userId: user._id, username: user.username });

      user.refreshToken = newRefreshToken;
      await user.save();

      const res = NextResponse.json({ message: "Protected data", user });
      res.cookies.set("accessToken", newAccessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "lax", 
        path: "/",
      });
      res.cookies.set("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/",
      });

      return res;
    } catch (refreshErr) {
      const res = NextResponse.json(
        { error: "Session expired or invalid. Signed out." },
        { status: 401 }
      );
      res.cookies.delete("accessToken");
      res.cookies.delete("refreshToken");
      return res;
    }
  }
}
