"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signup = signup;
exports.signin = signin;
exports.refreshTokenHandler = refreshTokenHandler;
exports.signout = signout;
const isProd = process.env.NODE_ENV === "production";
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const User_1 = require("../models/User");
const tokens_1 = require("../utils/tokens");
const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS);
async function signup(req, res) {
    try {
        const { username, name, email, password, location, bio } = req.body;
        if (!username || !name || !email || !password) {
            return res.status(400).json({ error: "Missing required fields" });
        }
        // check existing user
        const existing = await User_1.User.findOne({ $or: [{ email }, { username }] });
        if (existing)
            return res.status(409).json({ error: "User already exists" });
        // hash password
        const hashed = await bcryptjs_1.default.hash(password, SALT_ROUNDS);
        const user = new User_1.User({
            username,
            name,
            email,
            password: hashed,
            location,
            bio,
        });
        await user.save();
        const payload = { userId: user._id, username: user.username };
        const accessToken = (0, tokens_1.signAccessToken)(payload);
        const refreshToken = (0, tokens_1.signRefreshToken)(payload);
        user.refreshToken = refreshToken;
        await user.save();
        res.cookie("jid", refreshToken, {
            httpOnly: true,
            secure: isProd,
            sameSite: "none",
            path: "/",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });
        res.cookie("accessToken", accessToken, {
            httpOnly: false,
            secure: isProd,
            sameSite: "none",
            path: "/",
            maxAge: 15 * 60 * 1000, // 15 minutes
        });
        return res.status(201).json({
            message: "Signup successful",
            user: { id: user._id, username: user.username, email: user.email },
        });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Server error" });
    }
}
async function signin(req, res) {
    try {
        const { emailOrUsername, password } = req.body;
        if (!emailOrUsername || !password) {
            return res.status(400).json({ error: "Missing credentials" });
        }
        const user = await User_1.User.findOne({
            $or: [{ email: emailOrUsername }, { username: emailOrUsername }],
        });
        if (!user)
            return res.status(401).json({ error: "Invalid credentials" });
        const valid = await bcryptjs_1.default.compare(password, user.password);
        if (!valid)
            return res.status(401).json({ error: "Invalid credentials" });
        const payload = { userId: user._id, username: user.username };
        const accessToken = (0, tokens_1.signAccessToken)(payload);
        const refreshToken = (0, tokens_1.signRefreshToken)(payload);
        user.refreshToken = refreshToken;
        await user.save();
        res.cookie("jid", refreshToken, {
            httpOnly: true,
            secure: isProd,
            sameSite: "none",
            path: "/",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });
        res.cookie("accessToken", accessToken, {
            httpOnly: false,
            secure: isProd,
            sameSite: "none",
            path: "/",
            maxAge: 15 * 60 * 1000, // 15 minutes
        });
        return res.json({
            user: { id: user._id, email: user.email, username: user.username },
        });
    }
    catch {
        return res.status(500).json({ error: "Server error" });
    }
}
async function refreshTokenHandler(req, res) {
    try {
        const token = req.cookies.jid || req.body?.refreshToken || req.headers["x-refresh-token"];
        if (!token)
            return res.status(401).json({ error: "No refresh token provided" });
        let payload;
        try {
            payload = (0, tokens_1.verifyRefreshToken)(token);
        }
        catch {
            return res.status(401).json({ error: "Invalid refresh token" });
        }
        const user = await User_1.User.findById(payload.userId);
        if (!user || user.refreshToken !== token) {
            return res.status(401).json({ error: "Invalid refresh token" });
        }
        const newAccessToken = (0, tokens_1.signAccessToken)({ userId: user._id, username: user.username });
        const newRefreshToken = (0, tokens_1.signRefreshToken)({ userId: user._id, username: user.username });
        user.refreshToken = newRefreshToken;
        await user.save();
        res.cookie("jid", newRefreshToken, {
            httpOnly: true,
            secure: isProd,
            sameSite: "none",
            path: "/",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });
        res.cookie("accessToken", newAccessToken, {
            httpOnly: false,
            secure: isProd,
            sameSite: "none",
            path: "/",
            maxAge: 15 * 60 * 1000, // 15 minutes
        });
        return res.json({ accessToken: newAccessToken });
    }
    catch {
        return res.status(500).json({ error: "Server error" });
    }
}
async function signout(req, res) {
    try {
        const token = req.cookies?.jid;
        if (token) {
            const user = await User_1.User.findOne({ refreshToken: token });
            if (user) {
                user.refreshToken = undefined;
                await user.save();
            }
        }
        res.clearCookie("jid", { path: "/" });
        res.clearCookie("accessToken", { path: "/" });
        return res.json({ ok: true });
    }
    catch {
        return res.status(500).json({ error: "Server error" });
    }
}
