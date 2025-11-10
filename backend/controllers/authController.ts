const isProd = process.env.NODE_ENV === "production";

import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
dotenv.config();
import { User } from "../models/User";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/tokens";

const SALT_ROUNDS: number = parseInt(process.env.BCRYPT_SALT_ROUNDS!);

export async function signup(req: Request, res: Response) {
  try {
    const { username, name, email, password, location, bio } = req.body;

    if (!username || !name || !email || !password) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // check existing user
    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) return res.status(409).json({ error: "User already exists" });

    // hash password
    const hashed = await bcrypt.hash(password, SALT_ROUNDS);

    const user = new User({
      username,
      name,
      email,
      password: hashed,
      location,
      bio,
    });

    await user.save();

    const payload = { userId: user._id, username: user.username };
    const accessToken = signAccessToken(payload);          
    const refreshToken = signRefreshToken(payload);

    user.refreshToken = refreshToken;
    await user.save();
    return res.status(201).json({
      message: "Signup successful",
      accessToken,
      refreshToken,
      user: { id: user._id, username: user.username, email: user.email },
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
}

export async function signin(req: Request, res: Response) {
  try {
    const { emailOrUsername, password } = req.body;

    if (!emailOrUsername || !password) {
      return res.status(400).json({ error: "Missing credentials" });
    }

    const user = await User.findOne({
      $or: [{ email: emailOrUsername }, { username: emailOrUsername }],
    });

    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: "Invalid credentials" });

    const payload = { userId: user._id, username: user.username };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    user.refreshToken = refreshToken;
    await user.save();

    return res.json({
      accessToken,
      refreshToken,
      user: { id: user._id, email: user.email, username: user.username },
    });

  } catch {
    return res.status(500).json({ error: "Server error" });
  }
}

export async function refreshTokenHandler(req: Request, res: Response) {
  try {
    const token = req.cookies.jid || req.body?.refreshToken || req.headers["x-refresh-token"];
    if (!token) return res.status(401).json({ error: "No refresh token provided" });

    let payload: any;
    try {
      payload = verifyRefreshToken(token);
    } catch {
      return res.status(401).json({ error: "Invalid refresh token" });
    }

    const user = await User.findById(payload.userId);
    if (!user || user.refreshToken !== token) {
      return res.status(401).json({ error: "Invalid refresh token" });
    }

    const newAccessToken = signAccessToken({ userId: user._id, username: user.username });
    const newRefreshToken = signRefreshToken({ userId: user._id, username: user.username });

    user.refreshToken = newRefreshToken;
    await user.save();

    return res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });

  } catch {
    return res.status(500).json({ error: "Server error" });
  }
}

export async function signout(req: Request, res: Response) {
  try {
    const token = req.cookies?.jid;

    if (token) {
      const user = await User.findOne({ refreshToken: token });
      if (user) {
        user.refreshToken = undefined as any;
        await user.save();
      }
    }

    res.clearCookie("jid", { path: "/" });
    res.clearCookie("accessToken", { path: "/" });

    return res.json({ ok: true });

  } catch {
    return res.status(500).json({ error: "Server error" });
  }
}
