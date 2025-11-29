const express = require("express");
const router = express.Router();
const linkRequestController = require("../controllers/linkRequestController");
const { verifyToken } = require("../utils/auth");

// Middleware to verify JWT token
function authenticateToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({ error: "Access token required" });
    }

    const payload = verifyToken(token);
    if (!payload) {
        return res.status(403).json({ error: "Invalid or expired token" });
    }

    req.user = payload;
    next();
}

// Apply authentication to all routes
router.use(authenticateToken);

router.post("/send", linkRequestController.sendRequest.bind(linkRequestController));
router.post("/accept", linkRequestController.acceptRequest.bind(linkRequestController));
router.post("/reject", linkRequestController.rejectRequest.bind(linkRequestController));
router.get("/get", linkRequestController.getRequests.bind(linkRequestController));
router.post("/status", linkRequestController.getStatus.bind(linkRequestController));
router.get("/unseen-count", linkRequestController.getUnseenCount.bind(linkRequestController));
router.post("/mark-seen", linkRequestController.markAsSeen.bind(linkRequestController));

module.exports = router;

