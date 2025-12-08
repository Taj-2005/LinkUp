import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";

let transporterInstance: Transporter | null = null;
let transporterVerified = false;
const VERIFY_CACHE_DURATION = 5 * 60 * 1000;
let lastVerifyTime = 0;

function getLogoUrl(): string {
  return process.env.EMAIL_LOGO_URL || "https://res.cloudinary.com/doexqrehm/image/upload/v1763634808/logo_xfnbwl.png";
}

function getTransporter(): Transporter {
  if (transporterInstance) {
    return transporterInstance;
  }

  const emailHost = process.env.EMAIL_HOST;
  const emailPort = process.env.EMAIL_PORT;
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  if (!emailHost || !emailUser || !emailPass) {
    throw new Error("Email configuration is missing. Please set EMAIL_HOST, EMAIL_USER, and EMAIL_PASS environment variables.");
  }

  transporterInstance = nodemailer.createTransport({
    host: emailHost,
    port: parseInt(emailPort || "587"),
    secure: process.env.EMAIL_SECURE === "true",
    auth: {
      user: emailUser,
      pass: emailPass,
    },
    pool: true,
    maxConnections: 1,
    maxMessages: 100,
    rateDelta: 1000,
    rateLimit: 5,
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000,
    debug: process.env.NODE_ENV === "development",
    logger: process.env.NODE_ENV === "development",
  });

  if (process.env.NODE_ENV === "development") {
    transporterInstance.on("token", (token) => {
      console.log("[EMAIL] Token generated:", token);
    });
  }

  return transporterInstance;
}

async function verifyTransporterIfNeeded(): Promise<void> {
  const now = Date.now();
  const shouldVerify = !transporterVerified || (now - lastVerifyTime) > VERIFY_CACHE_DURATION;

  if (!shouldVerify) {
    return;
  }

  const transporter = getTransporter();
  const startTime = Date.now();

  try {
    await transporter.verify();
    transporterVerified = true;
    lastVerifyTime = now;
    const duration = Date.now() - startTime;
    console.log(`[EMAIL] Transporter verified in ${duration}ms`);
  } catch (error) {
    transporterVerified = false;
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("[EMAIL] Transporter verification failed:", {
      error: errorMessage,
      timestamp: new Date().toISOString(),
    });
    throw error;
  }
}

export async function sendVerificationEmail(
  email: string,
  token: string,
  username: string
) {
  const startTime = Date.now();
  const transporter = getTransporter();
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL!}/verify-email?token=${token}`;
  const logoUrl = getLogoUrl();

  const mailOptions = {
    from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Verify Your Email Address",
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="color-scheme" content="light dark">
<meta name="supported-color-schemes" content="light dark" />

<style>
body {
  margin: 0;
  padding: 0;
  background: #0f0f10;
  font-family: Arial, sans-serif;
  color: #ffffff !important;
}

.wrapper {
  max-width: 600px;
  margin: 30px auto;
  background: #121214;
  border-radius: 18px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.header {
  background: linear-gradient(135deg, #9333ea, #9333ea, #db2777);
  padding: 40px 20px;
  text-align: center;
  color: #ffffff !important;
}

.logo {
  width: 120px;
  margin-bottom: 10px;
}

.header-title {
  font-size: 28px;
  font-weight: 700;
  margin-top: 10px;
}

.subtitle {
  font-size: 15px;
  opacity: 0.95;
}

.content {
  padding: 30px 25px;
  font-size: 15px;
  line-height: 1.6;
  color: #e7e7e7 !important;
}

h2 {
  margin-top: 0;
  color: #ffffff !important;
}

.verify-btn {
  display: inline-block;
  padding: 15px 28px;
  background: linear-gradient(135deg, #9333ea, #9333ea, #db2777);
  color: #ffffff !important;
  font-weight: 600;
  border-radius: 10px;
  margin: 25px 0;
  font-size: 16px;
  text-decoration: none;
}

.link {
  color: #a78bfa !important;
  word-break: break-all;
}

.note {
  font-size: 13px;
  opacity: 0.8;
  color: #cccccc !important;
}

.footer {
  text-align: center;
  padding: 22px;
  font-size: 12px;
  background: #0d0d0e;
  color: #777 !important;
}

.footer a {
  color: #a78bfa !important;
}
</style>
</head>

<body>
  <div class="wrapper">
    <div class="header">
      <img src="${logoUrl}" alt="LinkUp Logo" class="logo" />
      <div class="header-title">Verify Your Email</div>
      <div class="subtitle">Welcome to LinkUp — We're Glad You're Here.</div>
    </div>
    <div class="content">
      <h2>Hi ${username} 👋</h2>

      <p>
        Thanks for signing up for <strong>LinkUp</strong>!
        We're building the next generation social platform where you can
        connect, explore, and grow with people worldwide.
      </p>

      <p>
        You're almost done — verify your email to activate your account
        and unlock <strong>LinkHub</strong>, <strong>LiveLinks</strong>,
        and all the LinkUp features 🚀
      </p>

      <center>
        <a href="${verificationUrl}" class="verify-btn">Verify Email Address</a>
      </center>

      <p>If the button doesn’t work, use the link below:</p>
      <p class="link">${verificationUrl}</p>

      <p class="note">
        This link is valid for 24 hours. If you did not create this account,
        simply ignore this email.
      </p>
    </div>
    <div class="footer">
      © 2025 LinkUp · All rights reserved.<br />
      <a href="${process.env.NEXT_PUBLIC_APP_URL!}">Visit LinkUp</a>
    </div>

  </div>
</body>
</html>
`,
  };

  try {
    await verifyTransporterIfNeeded();

    const sendStartTime = Date.now();
    const info = await transporter.sendMail(mailOptions);
    const sendDuration = Date.now() - sendStartTime;
    const totalDuration = Date.now() - startTime;

    console.log(`[EMAIL] Verification email sent successfully`, {
      to: email,
      messageId: info.messageId,
      sendDuration: `${sendDuration}ms`,
      totalDuration: `${totalDuration}ms`,
      timestamp: new Date().toISOString(),
    });

    return info;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const errorStack = error instanceof Error ? error.stack : undefined;
    const duration = Date.now() - startTime;

    console.error("[EMAIL] Failed to send verification email:", {
      to: email,
      error: errorMessage,
      stack: errorStack,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
    });
    throw error;
  }
}

export async function sendPasswordResetEmail(
  email: string,
  resetToken: string,
  username: string
) {
  const startTime = Date.now();
  const transporter = getTransporter();
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL!}/reset-password?token=${resetToken}`;
  const logoUrl = getLogoUrl();

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
  .header { background: linear-gradient(135deg,#9333ea,#9333ea,#db2777); padding:34px 18px; text-align:center; color:#fff; }
  .logo { width:110px; margin-bottom:6px; }
  .header-title { font-size:22px; font-weight:700; margin-top:6px; }
  .subtitle { font-size:13px; opacity:0.95; }
  .content { padding:26px 22px; font-size:15px; line-height:1.6; color:#e7e7e7; }
  h2 { margin:0 0 8px 0; color:#fff; }
  .btn { display:inline-block; padding:12px 22px; background: linear-gradient(135deg,#9333ea,#9333ea,#db2777); color:#fff; font-weight:600; border-radius:10px; margin:18px 0; text-decoration:none; }
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
      <img src="${logoUrl}" alt="LinkUp Logo" class="logo" />
      <div class="header-title">Reset your password</div>
      <div class="subtitle">Don't worry — it happens to the best of us.</div>
    </div>

    <div class="content">
      <h2>Hello ${username || "there"} 👋</h2>

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
      © 2025 LinkUp · All rights reserved.<br/>
      <a href="${process.env.NEXT_PUBLIC_APP_URL!}">Visit LinkUp</a>
    </div>
  </div>
</body>
</html>
    `,
    text: `Reset your LinkUp password\n\nOpen this link to reset your password (expires in 30 minutes):\n\n${resetUrl}\n\nIf you did not request this, ignore this email.`,
  };

  try {
    await verifyTransporterIfNeeded();

    const sendStartTime = Date.now();
    const info = await transporter.sendMail(mailOptions);
    const sendDuration = Date.now() - sendStartTime;
    const totalDuration = Date.now() - startTime;

    console.log(`[EMAIL] Password reset email sent successfully`, {
      to: email,
      messageId: info.messageId,
      sendDuration: `${sendDuration}ms`,
      totalDuration: `${totalDuration}ms`,
      timestamp: new Date().toISOString(),
    });

    return info;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const errorStack = error instanceof Error ? error.stack : undefined;
    const duration = Date.now() - startTime;

    console.error("[EMAIL] Failed to send password reset email:", {
      to: email,
      error: errorMessage,
      stack: errorStack,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
    });
    throw error;
  }
}

export async function sendEngagementEmail(
  email: string,
  username: string
) {
  const startTime = Date.now();
  const transporter = getTransporter();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!;
  const logoUrl = getLogoUrl();

  const mailOptions = {
    from: `"${process.env.EMAIL_FROM_NAME || "LinkUp"}" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "⚡ Your LinkUp just got a major upgrade — check it out!",
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta name="color-scheme" content="light dark">
<meta name="supported-color-schemes" content="light dark" />
<meta name="description" content="Experience real-time notifications and instant linkup request management on LinkUp - accept, reject, or unlink connections instantly with seamless UX." />

<style>
body {
  margin: 0;
  padding: 0;
  background: #0f0f10;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
  color: #ffffff !important;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.wrapper {
  max-width: 600px;
  margin: 30px auto;
  background: #121214;
  border-radius: 18px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.header {
  background: linear-gradient(135deg, #9333ea, #9333ea, #db2777);
  padding: 40px 20px;
  text-align: center;
  color: #ffffff !important;
}

.logo {
  width: 120px;
  margin-bottom: 10px;
  height: auto;
}

.header-title {
  font-size: 28px;
  font-weight: 700;
  margin-top: 10px;
  line-height: 1.2;
}

.subtitle {
  font-size: 15px;
  opacity: 0.95;
  margin-top: 8px;
}

.content {
  padding: 30px 25px;
  font-size: 15px;
  line-height: 1.7;
  color: #e7e7e7 !important;
}

h2 {
  margin-top: 0;
  color: #ffffff !important;
  font-size: 24px;
  font-weight: 600;
}

h3 {
  color: #ffffff !important;
  font-size: 18px;
  font-weight: 600;
  margin-top: 24px;
  margin-bottom: 12px;
}

.cta-btn {
  display: inline-block;
  padding: 15px 32px;
  background: linear-gradient(135deg, #9333ea, #9333ea, #db2777);
  color: #ffffff !important;
  font-weight: 600;
  border-radius: 10px;
  margin: 25px 0;
  font-size: 16px;
  text-decoration: none;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  box-shadow: 0 4px 12px rgba(147, 51, 234, 0.3);
}

.cta-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(147, 51, 234, 0.4);
}

.link {
  color: #a78bfa !important;
  word-break: break-all;
  text-decoration: none;
}

.feature-list {
  margin: 20px 0;
  padding-left: 0;
  list-style: none;
}

.feature-list li {
  padding: 12px 0;
  padding-left: 32px;
  position: relative;
  color: #e7e7e7 !important;
  line-height: 1.6;
}

.feature-list li:before {
  content: "⚡";
  position: absolute;
  left: 0;
  font-size: 18px;
}

.highlight-box {
  background: rgba(147, 51, 234, 0.1);
  border-left: 3px solid #9333ea;
  padding: 16px 20px;
  margin: 24px 0;
  border-radius: 8px;
}

.highlight-box strong {
  color: #a78bfa !important;
  display: block;
  margin-bottom: 8px;
  font-size: 16px;
}

.note {
  font-size: 13px;
  opacity: 0.85;
  color: #cccccc !important;
  margin-top: 20px;
  line-height: 1.6;
}

.footer {
  text-align: center;
  padding: 22px;
  font-size: 12px;
  background: #0d0d0e;
  color: #777 !important;
  line-height: 1.6;
}

.footer a {
  color: #a78bfa !important;
  text-decoration: none;
}

@media (max-width: 600px) {
  .wrapper {
    margin: 15px;
    border-radius: 12px;
  }

  .header {
    padding: 30px 18px;
  }

  .header-title {
    font-size: 24px;
  }

  .content {
    padding: 24px 20px;
    font-size: 14px;
  }
}
</style>
</head>

<body>
  <div class="wrapper">
    <div class="header">
      <img src="${logoUrl}" alt="LinkUp - Real-Time Social Networking Platform" class="logo" />
      <div class="header-title">Your Network Just Got Smarter ⚡</div>
      <div class="subtitle">Real-time updates, instant connections, zero delays</div>
    </div>
    <div class="content">
      <h2>Hi ${username} 👋</h2>

      <p>
        We've been working behind the scenes to make LinkUp faster, smarter, and more connected than ever. 
        Say hello to <strong>real-time everything</strong> — notifications that pop instantly, connections that update live, 
        and a networking experience that actually feels real-time.
      </p>

      <div class="highlight-box">
        <strong>⚡ Live Notifications That Actually Work</strong>
        No more refreshing. No more waiting. When someone likes your link, comments on your post, or wants to connect, 
        you'll know immediately. Our real-time system keeps you in the loop 24/7, syncing seamlessly across all your devices.
      </div>

      <h3>🎯 What's New & Improved</h3>

      <ul class="feature-list">
        <li>
          <strong>One-Click Connections:</strong> Accept linkup requests instantly. Your network updates live, 
          and both of you get notified in real-time. It's that simple.
        </li>
        <li>
          <strong>Smart Request Management:</strong> Decline requests with ease. Our streamlined flow respects your choices 
          and keeps things moving smoothly.
        </li>
        <li>
          <strong>Flexible Network Control:</strong> Unlink from anyone, anytime. Changes reflect instantly across the platform, 
          giving you full control over your connections.
        </li>
        <li>
          <strong>Zero-Lag Updates:</strong> Every action — accepts, rejects, unlinks — happens in real-time. 
          Your connection counts and network lists stay perfectly in sync, automatically.
        </li>
      </ul>

      <p>
        <strong>The Tech Behind It:</strong> We've built this on a real-time infrastructure that makes every interaction 
        feel instant. Powered by Socket.IO, your network updates happen live — no delays, no refreshes, just pure responsiveness. 
        Whether you're building connections or managing your network, everything happens in real-time.
      </p>

      <p>
        <strong>Ready to see it in action?</strong> Jump back into LinkUp and experience networking that actually feels alive. 
        Build connections faster, manage relationships effortlessly, and watch your network grow in real-time.
      </p>

      <center>
        <a href="${appUrl}" class="cta-btn">Try It Now →</a>
      </center>

      <p class="note">
        <strong>💡 Pro Tip:</strong> Keep LinkUp open to catch notifications as they happen. Our smart caching keeps everything 
        fresh automatically — you'll always see the latest updates without lifting a finger.
      </p>

      <p>
        Thanks for being part of LinkUp! We're constantly improving to give you the best networking experience possible. 
        These updates are just the start — there's more exciting stuff coming your way. Can't wait to see what connections you build next! 🚀
      </p>

      <p style="margin-top: 24px; font-size: 14px; color: #a78bfa !important;">
        <strong>Got thoughts?</strong> We're all ears! Your feedback shapes what we build next.
      </p>
    </div>
    <div class="footer">
      © 2025 LinkUp · All rights reserved.<br />
      <a href="${appUrl}">Visit LinkUp</a> ·
      <a href="${appUrl}/settings">Manage Preferences</a>
    </div>
  </div>
</body>
</html>
`,
    text: `Hey ${username}!\n\nWe've been working behind the scenes to make LinkUp faster, smarter, and more connected than ever. Say hello to real-time everything — notifications that pop instantly, connections that update live, and a networking experience that actually feels real-time.\n\n⚡ Live Notifications That Actually Work\nNo more refreshing. No more waiting. When someone likes your link, comments on your post, or wants to connect, you'll know immediately. Our real-time system keeps you in the loop 24/7, syncing seamlessly across all your devices.\n\n🎯 What's New & Improved:\n\n• One-Click Connections: Accept linkup requests instantly. Your network updates live, and both of you get notified in real-time. It's that simple.\n\n• Smart Request Management: Decline requests with ease. Our streamlined flow respects your choices and keeps things moving smoothly.\n\n• Flexible Network Control: Unlink from anyone, anytime. Changes reflect instantly across the platform, giving you full control over your connections.\n\n• Zero-Lag Updates: Every action — accepts, rejects, unlinks — happens in real-time. Your connection counts and network lists stay perfectly in sync, automatically.\n\nThe Tech Behind It: We've built this on a real-time infrastructure that makes every interaction feel instant. Powered by Socket.IO, your network updates happen live — no delays, no refreshes, just pure responsiveness.\n\nReady to see it in action? Jump back into LinkUp: ${appUrl}\n\n💡 Pro Tip: Keep LinkUp open to catch notifications as they happen. Our smart caching keeps everything fresh automatically.\n\nThanks for being part of LinkUp! We're constantly improving to give you the best networking experience possible. These updates are just the start — there's more exciting stuff coming your way.\n\n- The LinkUp Team`,
  };

  try {
    await verifyTransporterIfNeeded();

    const sendStartTime = Date.now();
    const info = await transporter.sendMail(mailOptions);
    const sendDuration = Date.now() - sendStartTime;
    const totalDuration = Date.now() - startTime;

    console.log(`[EMAIL] Engagement email sent successfully`, {
      to: email,
      messageId: info.messageId,
      sendDuration: `${sendDuration}ms`,
      totalDuration: `${totalDuration}ms`,
      timestamp: new Date().toISOString(),
    });

    return info;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const errorStack = error instanceof Error ? error.stack : undefined;
    const duration = Date.now() - startTime;

    console.error("[EMAIL] Failed to send engagement email:", {
      to: email,
      error: errorMessage,
      stack: errorStack,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
    });
    throw error;
  }
}
