import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import crypto from "crypto";
import { User } from "@/models/User";
import { dbConnect } from "@/lib/dbConnect";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || "587"),
  secure: process.env.EMAIL_SECURE === "true",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

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
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

    user.resetToken = resetToken;
    user.resetTokenExpiry = Date.now() + 1000 * 60 * 30; 
    await user.save();

    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME || "LinkUp"}" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Reset your LinkUp password",
      html: `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="color-scheme" content="light dark">
<meta name="supported-color-schemes" content="light dark">
<style>
  body { margin:0; padding:0; background:#0f0f10; font-family: Arial, sans-serif; color: #e7e7e7; }
  .wrapper { max-width:600px; margin:28px auto; background:#121214; border-radius:16px; overflow:hidden; border:1px solid rgba(255,255,255,0.06); }
  .header { background: linear-gradient(135deg,#7f5bff,#a855f7,#6366f1); padding:34px 18px; text-align:center; color:#fff; }
  .logo { width:110px; margin-bottom:6px; }
  .header-title { font-size:22px; font-weight:700; margin-top:6px; }
  .subtitle { font-size:13px; opacity:0.95; }
  .content { padding:26px 22px; font-size:15px; line-height:1.6; color:#e7e7e7; }
  h2 { margin:0 0 8px 0; color:#fff; }
  .btn { display:inline-block; padding:12px 22px; background: linear-gradient(135deg,#8b5cf6,#6366f1); color:#fff; font-weight:600; border-radius:10px; margin:18px 0; text-decoration:none; }
  .link { color:#a78bfa; word-break:break-all; font-size:13px; }
  .note { font-size:13px; opacity:0.85; color:#d0d0d0; }
  .footer { text-align:center; padding:18px; font-size:12px; background:#0d0d0e; color:#9b9b9b; }
  .muted { color:#bdbdbd; font-size:13px; }
  @media (prefers-color-scheme: light) {
    body { background:#f6f7fb; color:#111827; }
    .wrapper { background:#fff; border:1px solid rgba(0,0,0,0.04); }
    .content { color:#111827; }
    .footer { background:#fafafa; color:#666; }
  }
</style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <img src="https://res.cloudinary.com/doexqrehm/image/upload/v1763634808/logo_xfnbwl.png" alt="LinkUp Logo" class="logo" />
      <div class="header-title">Reset your password</div>
      <div class="subtitle">Don't worry — it happens to the best of us.</div>
    </div>

    <div class="content">
      <h2>Hello ${user.username || user.name || "there"} 👋</h2>

      <p class="muted">
        We received a request to reset the password for your LinkUp account associated with <strong>${email}</strong>.
        Use the button below to set a new password. For your safety the link will expire in <strong>30 minutes</strong>.
      </p>

    <center>
    <a href="${resetUrl}"
        class="btn"
        style="color:#ffffff !important; text-decoration:none !important;">
        Reset Password
    </a>
    </center>

      <p class="muted">If the button doesn't work, copy and paste the link below into your browser:</p>
      <p class="link">${resetUrl}</p>

      <p class="note">
        If you didn't request a password reset, you can safely ignore this email — no changes were made to your account.
        If you think someone is trying to access your account, please contact support.
      </p>
    </div>

    <div class="footer">
      © ${new Date().getFullYear()} LinkUp · All rights reserved.<br/>
      <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://link-up-web.vercel.app"}" style="color:inherit; text-decoration:none;">Visit LinkUp</a>
    </div>
  </div>
</body>
</html>
      `,
      text: `Reset your LinkUp password\n\nOpen this link to reset your password (expires in 30 minutes):\n\n${resetUrl}\n\nIf you did not request this, ignore this email.`,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ message: "Reset email sent!" });
  } catch (error) {
    console.error("Forgot-password error:", error);
    return NextResponse.json(
      { message: "Something went wrong while sending reset email." },
      { status: 500 }
    );
  }
}
