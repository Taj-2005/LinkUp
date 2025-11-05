"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signAccessToken = signAccessToken;
exports.signRefreshToken = signRefreshToken;
exports.verifyAccessToken = verifyAccessToken;
exports.verifyRefreshToken = verifyRefreshToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const ACCESS_TOKEN_EXPIRES = Number(process.env.ACCESS_TOKEN_EXPIRES);
const REFRESH_TOKEN_EXPIRES = Number(process.env.REFRESH_TOKEN_EXPIRES);
function signAccessToken(payload) {
    return jsonwebtoken_1.default.sign(payload, JWT_ACCESS_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRES });
}
function signRefreshToken(payload) {
    if (!JWT_REFRESH_SECRET)
        throw new Error("Refresh token secret is not defined");
    return jsonwebtoken_1.default.sign(payload, JWT_REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRES });
}
function verifyAccessToken(token) {
    return jsonwebtoken_1.default.verify(token, JWT_ACCESS_SECRET);
}
function verifyRefreshToken(token) {
    if (!JWT_REFRESH_SECRET)
        throw new Error("Refresh token secret is not defined");
    return jsonwebtoken_1.default.verify(token, JWT_REFRESH_SECRET);
}
