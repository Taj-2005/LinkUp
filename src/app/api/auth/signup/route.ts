import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { dbConnect } from "@/lib/dbConnect";
import { User } from "@/models/User";
import { sendVerificationEmail } from "@/lib/email";

const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || "10");

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { username, name, email, password, location, bio, sex } = await req.json();

    if (!username || !name || !email || !password || !sex) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const existing = await User.findOne({ 
      $or: [{ email }, { username }] 
    });

    if (existing) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 409 }
      );
    }

    const hashed = await bcrypt.hash(password, SALT_ROUNDS);
    
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const user = await User.create({
      username,
      name,
      email,
      password: hashed,
      location,
      bio,
      sex,
      isVerified: false,
      verificationToken,
      verificationTokenExpiry,
    });

    try {
      await sendVerificationEmail(email, verificationToken, username);
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
    }

    const res = NextResponse.json({
      message: "Signup successful. Please check your email to verify your account.",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isVerified: user.isVerified,
      },
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