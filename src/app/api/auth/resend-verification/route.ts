import { NextResponse } from "next/server";
import crypto from "crypto";
import { dbConnect } from "@/lib/dbConnect";
import { User } from "@/models/User";
import { sendVerificationEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { email } = await req.json();

    const user = await User.findOne({ email });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const token = crypto.randomBytes(32).toString("hex");

    user.verificationToken = token;
    user.verificationTokenExpiry = new Date(Date.now() + 24 * 3600 * 1000);
    await user.save();

    await sendVerificationEmail(email, token, user.username);

    return NextResponse.json({ ok: true });

  } catch{
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
