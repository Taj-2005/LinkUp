import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { dbConnect } from "@/lib/dbConnect";
import { User } from "@/models/User";
import { signAccessToken, signRefreshToken } from "@/lib/tokens";

export async function POST(req: Request) {
  try {
    console.log("🟢 [SIGNIN] Hit endpoint");

    await dbConnect();
    console.log("✅ Connected to DB");

    const { emailOrUsername, password } = await req.json();
    console.log("📩 Body:", { emailOrUsername });

    if (!emailOrUsername || !password)
      return NextResponse.json({ error: "Missing credentials" }, { status: 400 });

    const user = await User.findOne({
      $or: [{ email: emailOrUsername }, { username: emailOrUsername }],
    });

    console.log("👤 User found:", !!user);

    if (!user) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

    const valid = await bcrypt.compare(password, user.password);
    console.log("🔑 Password valid:", valid);

    if (!valid) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

    const payload = { userId: user._id, username: user.username };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    user.refreshToken = refreshToken;
    await user.save();

    console.log("✅ Tokens generated");

    const res = NextResponse.json({
      user: { id: user._id, email: user.email, username: user.username },
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
} catch (err: unknown) {
  console.error("❌ SIGNIN ERROR:", err);

  const message =
    err instanceof Error ? err.message : "Unexpected server error";

  return NextResponse.json(
    { error: "Server error", details: message },
    { status: 500 }
  );
}
  
}
