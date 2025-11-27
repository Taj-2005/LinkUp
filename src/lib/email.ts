import nodemailer from "nodemailer";

function createTransporter() {
  const emailHost = process.env.EMAIL_HOST;
  const emailPort = process.env.EMAIL_PORT;
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  if (!emailHost || !emailUser || !emailPass) {
    throw new Error("Email configuration is missing. Please set EMAIL_HOST, EMAIL_USER, and EMAIL_PASS environment variables.");
  }

  return nodemailer.createTransport({
    host: emailHost,
    port: parseInt(emailPort || "587"),
    secure: process.env.EMAIL_SECURE === "true",
    auth: {
      user: emailUser,
      pass: emailPass,
    },
  });
}

export async function sendVerificationEmail(
  email: string,
  token: string,
  username: string
) {
  const transporter = createTransporter();
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://link-up-web.vercel.app"}/verify-email?token=${token}&email=${email}`;

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
  background: linear-gradient(135deg, #7f5bff, #a855f7, #6366f1);
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
  background: linear-gradient(135deg, #8b5cf6, #6366f1);
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
      <img src="https://res.cloudinary.com/doexqrehm/image/upload/v1763634808/logo_xfnbwl.png"
           alt="LinkUp Logo" class="logo" />
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
      <a href="https://link-up-web.vercel.app">Visit LinkUp</a>
    </div>

  </div>
</body>
</html>
`,
  };

  try {
    await transporter.verify();
    await transporter.sendMail(mailOptions);
    console.log(`Verification email sent successfully to: ${email}`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Failed to send verification email:", {
      email,
      error: errorMessage,
      timestamp: new Date().toISOString(),
    });
    throw error; // Re-throw to let caller handle
  }
}
