import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { dbConnect } from "@/lib/dbConnect";
import { User } from "@/models/User";
import { signAccessToken, signRefreshToken } from "@/lib/tokens";

const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || "10");

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { username, name, email, password, location, bio, sex } = await req.json();

    if (!username || !name || !email || !password || !sex) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) return NextResponse.json({ error: "User already exists" }, { status: 409 });

    const hashed = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await User.create({ username, name, email, password: hashed, location, bio, sex });

    const payload = { userId: user._id, username: user.username };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    user.refreshToken = refreshToken;
    await user.save();

    const res = NextResponse.json({
      message: "Signup successful",
      user: { id: user._id, username: user.username, email: user.email },
    });

    res.cookies.set("accessToken", accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
    });

    res.cookies.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
    });

    return res;
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
