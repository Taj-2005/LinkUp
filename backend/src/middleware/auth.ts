import { Request, Response, NextFunction } from "express";
import { verifyAccessToken, verifyRefreshToken } from "../utils/tokens";
import {User} from "../models/User";

export interface AuthRequest extends Request {
  user?: any;
}

export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies?.jid; 

  if (!token) {
    return res.status(401).json({ error: "Not authenticated: token missing" });
  }

  try {
    const payload = verifyRefreshToken(token) as any;

    const user = await User.findById(payload.userId).select("-password -__v");

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    req.user = user; 
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired access token" });
  }
};
