import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { dbConnect } from "@/lib/dbConnect";
import { User } from "@/models/User";
import { requireAuth } from "@/lib/auth";
import { validateAndRefreshTokens } from "@/lib/authHelpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  await dbConnect();
  const cookieStore = await cookies();

  try {
    const user = await requireAuth();
    const allUsers = await User.find();
    const users = allUsers.filter((thisUser) => thisUser.username !== user.username);
    return NextResponse.json(users);
  } catch {
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

    const result = await validateAndRefreshTokens(refreshToken);

    if (!result.success || !result.user) {
      const res = NextResponse.json({ error: result.error }, { status: 401 });
      res.cookies.delete("accessToken");
      res.cookies.delete("refreshToken");
      return res;
    }

    const res = NextResponse.next();
    res.cookies.set("accessToken", result.newAccessToken!, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
    });
    res.cookies.set("refreshToken", result.newRefreshToken!, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
    });

    const allUsers = await User.find();
    const users = allUsers.filter((thisUser) => thisUser.username !== result.user.username);

    return NextResponse.json(users);
  }
}
