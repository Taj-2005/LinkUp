import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || "587"),
  secure: process.env.EMAIL_SECURE === "true",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendVerificationEmail(
  email: string,
  token: string,
  username: string
) {
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`;

  const mailOptions = {
    from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Verify Your Email Address",
    html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8" />
            <title>Email Verification</title>

            <style>
            /* RESET */
            body {
                margin: 0;
                padding: 0;
                font-family: "Inter", "Arial", sans-serif;
                background: #0f0f10;
                color: #e5e5e5;
            }
            a {
                text-decoration: none;
            }

            /* Container */
            .wrapper {
                max-width: 600px;
                margin: 30px auto;
                background: #121214;
                border-radius: 18px;
                overflow: hidden;
                box-shadow: 0 0 40px rgba(120, 75, 255, 0.25);
                border: 1px solid rgba(255, 255, 255, 0.05);
            }

            /* Header */
            .header {
                background: linear-gradient(135deg, #7f5bff, #a855f7, #6366f1);
                padding: 40px 20px;
                text-align: center;
                color: white;
            }

            .logo {
                width: 120px;
                margin-bottom: 10px;
            }

            .header-title {
                font-size: 28px;
                font-weight: 700;
                margin: 10px 0 4px;
            }

            .subtitle {
                font-size: 14px;
                opacity: 0.85;
                margin-top: 2px;
            }

            /* Content */
            .content {
                padding: 35px 25px;
                line-height: 1.7;
                font-size: 15px;
            }

            .content h2 {
                margin-top: 0;
                color: #ffffff;
            }

            /* Button */
            .verify-btn {
                display: inline-block;
                padding: 15px 28px;
                background: linear-gradient(135deg, #8b5cf6, #6366f1);
                color: white !important;
                font-weight: 600;
                border-radius: 10px;
                margin: 25px 0;
                font-size: 16px;
                box-shadow: 0 4px 20px rgba(139, 92, 246, 0.4);
            }

            /* Link text */
            .link {
                word-break: break-all;
                color: #a78bfa;
                font-weight: 500;
            }

            .note {
                font-size: 13px;
                opacity: 0.7;
                margin-top: 10px;
            }

            /* Footer */
            .footer {
                text-align: center;
                padding: 22px;
                font-size: 12px;
                background: #0d0d0e;
                color: #777;
            }

            .footer a {
                color: #a78bfa;
            }
            </style>
        </head>

        <body>
            <div class="wrapper">
            <!-- HEADER -->
            <div class="header">
                <img src="https://res.cloudinary.com/doexqrehm/image/upload/v1763634808/logo_xfnbwl.png" alt="LinkUp Logo" class="logo" />
                <div class="header-title">Verify Your Email</div>
                <div class="subtitle">Welcome to LinkUp — Your Social Hub.</div>
            </div>

            <!-- CONTENT -->
            <div class="content">
                <h2>Hi ${username} 👋</h2>

                <p>
                Thanks for joining <strong>LinkUp</strong> — where people connect, share, explore, and grow.
                You're just one step away from activating your account.
                </p>

                <p>
                Tap the button below to verify your email and start using
                <strong>LiveLinks</strong>, <strong>LinkHub</strong>, and the entire LinkUp experience 🚀
                </p>

                <center>
                <a href="${verificationUrl}" class="verify-btn">Verify Email Address</a>
                </center>

                <p>If the button doesn't work, copy and paste this link:</p>

                <p class="link">${verificationUrl}</p>

                <p class="note">
                This link is valid for 24 hours. If you didn't create this account, please ignore this email.
                </p>
            </div>

            <!-- FOOTER -->
            <div class="footer">
                © 2025 LinkUp · All rights reserved.<br />
                <a href="https://link-up-web.vercel.app">Visit LinkUp</a>
            </div>
            </div>
        </body>
        </html>
    `,
  };

  await transporter.sendMail(mailOptions);
}