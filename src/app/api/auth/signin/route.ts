import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { dbConnect } from "@/lib/dbConnect";
import { User } from "@/models/User";
import { signAccessToken, signRefreshToken } from "@/lib/tokens";

const isProd = process.env.NODE_ENV === "production";

export async function POST(req: Request) {
  try {
    await dbConnect();

    const { emailOrUsername, password } = await req.json();

    if (!emailOrUsername || !password)
      return NextResponse.json({ error: "Missing credentials" }, { status: 400 });

    const user = await User.findOne({
      $or: [{ email: emailOrUsername }, { username: emailOrUsername }],
    });

    if (!user)
      return NextResponse.json(
        { error: "User does not exist" },
        { status: 404 }
      );

    if (!user.isVerified) {
      return NextResponse.json(
        { error: "Please verify your email before signing in", needsVerification: true },
        { status: 403 }
      );
    }

    const valid = await bcrypt.compare(password, user.password);

    if (!valid)
      return NextResponse.json(
        { error: "Incorrect password" },
        { status: 401 }
      );

    const payload = { userId: user._id, username: user.username };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    user.refreshToken = refreshToken;
    await user.save();

    const res = NextResponse.json({
      user: { id: user._id, email: user.email, username: user.username },
    });

    res.cookies.set("accessToken", accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
    res.cookies.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return res;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unexpected server error";
    return NextResponse.json(
      { error: "Server error", details: message },
      { status: 500 }
    );
  }
}