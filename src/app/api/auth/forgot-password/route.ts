import { NextResponse } from "next/server";
import crypto from "crypto";
import { User } from "@/models/User";
import { dbConnect } from "@/lib/dbConnect";
import { sendPasswordResetEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 });
    }

    const user = await User.findOne({ email });
    if (!user)
      return NextResponse.json({ message: "User not found" }, { status: 404 });

    const resetToken = crypto.randomBytes(32).toString("hex");

    user.resetToken = resetToken;
    user.resetTokenExpiry = Date.now() + 1000 * 60 * 30;
    await user.save();

    try {
      await sendPasswordResetEmail(email, resetToken, user.username || user.name || "there");
      return NextResponse.json({ message: "Reset email sent!" });
    } catch (emailError) {
      console.error("[FORGOT-PASSWORD] Email sending failed:", emailError);
      return NextResponse.json(
        { message: "Email service error. Please try again later or contact support." },
        { status: 500 }
      );
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const errorStack = error instanceof Error ? error.stack : undefined;

    console.error("[FORGOT-PASSWORD] Error:", {
      message: errorMessage,
      stack: errorStack,
      timestamp: new Date().toISOString(),
    });

    const isProduction = process.env.NODE_ENV === "production";

    return NextResponse.json(
      {
        message: isProduction
          ? "Something went wrong. Please try again later or contact support."
          : `Error: ${errorMessage}`
      },
      { status: 500 }
    );
  }
}
