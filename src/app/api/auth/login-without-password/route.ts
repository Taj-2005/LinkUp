import { NextResponse } from "next/server";
import { signAccessToken, signRefreshToken } from "@/lib/tokens";
import { dbConnect } from "@/lib/dbConnect";
import { User } from "@/models/User";
import { setAuthCookies } from "@/lib/cookies";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { email } = await req.json();

    const user = await User.findOne({ email });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const payload = { userId: user._id, username: user.username };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    user.refreshToken = refreshToken;
    await user.save();

    const res = NextResponse.json({ ok: true, user });

    setAuthCookies(res, accessToken, refreshToken);

    return res;

  } catch{
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
