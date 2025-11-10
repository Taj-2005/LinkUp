import express from "express";
import { requireAuth, AuthRequest } from "../middleware/auth";
const router = express.Router();

router.get("/me", requireAuth, async (req: AuthRequest, res: express.Response) => {
  return res.json({ message: "Protected data", user: req.user });
});

export default router;