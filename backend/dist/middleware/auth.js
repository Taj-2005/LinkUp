"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = void 0;
const tokens_1 = require("../utils/tokens");
const User_1 = require("../models/User");
const requireAuth = async (req, res, next) => {
    const token = req.cookies?.jid;
    if (!token) {
        return res.status(401).json({ error: "Not authenticated: token missing" });
    }
    try {
        const payload = (0, tokens_1.verifyRefreshToken)(token);
        const user = await User_1.User.findById(payload.userId).select("-password -__v");
        if (!user) {
            return res.status(401).json({ error: "User not found" });
        }
        req.user = user;
        next();
    }
    catch (err) {
        return res.status(401).json({ error: "Invalid or expired access token" });
    }
};
exports.requireAuth = requireAuth;
