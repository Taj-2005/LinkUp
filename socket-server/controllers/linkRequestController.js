const linkRequestService = require("../services/linkRequestService");
const { emitLinkUpEvent } = require("../utils/emitLinkUpEvent");
const { emitCombinedUnseenCount } = require("../utils/emitNotificationUpdate");

class LinkRequestController {
    async sendRequest(req, res) {
        try {
            const { receiverId } = req.body;
            const requesterId = req.user.userId;

            if (!receiverId) {
                return res.status(400).json({ error: "Receiver ID is required" });
            }

            const request = await linkRequestService.sendRequest(requesterId, receiverId);

            const io = req.app.get("io");
            if (io) {
                const authenticatedNamespace = io.of("/");

                await emitLinkUpEvent(authenticatedNamespace, "requested", requesterId, receiverId, false);

                const unseenRequestCount = await linkRequestService.getUnseenRequestCount(receiverId);
                await emitCombinedUnseenCount(authenticatedNamespace, receiverId, unseenRequestCount);
            }

            res.json({ success: true, request });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async acceptRequest(req, res) {
        try {
            const { requestId } = req.body;
            const userId = req.user.userId;

            if (!requestId) {
                return res.status(400).json({ error: "Request ID is required" });
            }

            const request = await linkRequestService.acceptRequest(requestId, userId);

            const io = req.app.get("io");
            if (io) {
                const authenticatedNamespace = io.of("/");
                const requesterId = request.requesterId.toString();
                const receiverId = request.receiverId.toString();

                await emitLinkUpEvent(authenticatedNamespace, "accepted", requesterId, receiverId, true);

                const unseenRequestCount = await linkRequestService.getUnseenRequestCount(userId);
                await emitCombinedUnseenCount(authenticatedNamespace, userId, unseenRequestCount);
            }

            res.json({ success: true, request });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async rejectRequest(req, res) {
        try {
            const { requestId } = req.body;
            const userId = req.user.userId;

            if (!requestId) {
                return res.status(400).json({ error: "Request ID is required" });
            }

            const request = await linkRequestService.rejectRequest(requestId, userId);

            const io = req.app.get("io");
            if (io) {
                const authenticatedNamespace = io.of("/");
                const requesterId = request.requesterId.toString();
                const receiverId = request.receiverId.toString();

                await emitLinkUpEvent(authenticatedNamespace, "rejected", requesterId, receiverId, false);

                const unseenRequestCount = await linkRequestService.getUnseenRequestCount(userId);
                await emitCombinedUnseenCount(authenticatedNamespace, userId, unseenRequestCount);
            }

            res.json({ success: true, request });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async getRequests(req, res) {
        try {
            const userId = req.user.userId;
            const requests = await linkRequestService.getRequestsForUser(userId);

            res.json({ requests });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async getStatus(req, res) {
        try {
            const { receiverId } = req.body;
            const requesterId = req.user.userId;

            if (!receiverId) {
                return res.status(400).json({ error: "Receiver ID is required" });
            }

            const statusResult = await linkRequestService.getRequestStatus(requesterId, receiverId);

            res.json(statusResult);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async getUnseenCount(req, res) {
        try {
            const userId = req.user.userId;
            const count = await linkRequestService.getUnseenRequestCount(userId);
            res.json({ count });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async markAsSeen(req, res) {
        try {
            const { requestId } = req.body;
            const userId = req.user.userId;

            if (!requestId) {
                return res.status(400).json({ error: "Request ID is required" });
            }

            await linkRequestService.markRequestAsSeen(requestId, userId);

            const io = req.app.get("io");
            if (io) {
                const authenticatedNamespace = io.of("/");
                const unseenRequestCount = await linkRequestService.getUnseenRequestCount(userId);
                await emitCombinedUnseenCount(authenticatedNamespace, userId, unseenRequestCount);
            }

            res.json({ success: true });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async getBatchStatus(req, res) {
        try {
            const userId = req.user.userId;
            const idsParam = req.query.ids;

            if (!idsParam || typeof idsParam !== "string") {
                return res.status(400).json({ error: "ids query parameter is required (comma-separated)" });
            }

            const targetUserIds = idsParam
                .split(",")
                .map(id => id.trim())
                .filter(id => id.length > 0);

            if (targetUserIds.length === 0) {
                return res.json({});
            }

            if (targetUserIds.length > 1000) {
                return res.status(400).json({ error: "Maximum 1000 user IDs allowed per batch" });
            }

            const statusMap = await linkRequestService.getBatchRequestStatus(userId, targetUserIds);

            res.json(statusMap);
        } catch (error) {
            console.error("Error fetching batch link statuses:", error);
            res.status(400).json({ error: error.message });
        }
    }
}

module.exports = new LinkRequestController();
