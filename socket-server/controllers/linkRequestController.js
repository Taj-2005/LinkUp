const linkRequestService = require("../services/linkRequestService");

class LinkRequestController {
    async sendRequest(req, res) {
        try {
            const { receiverId } = req.body;
            const requesterId = req.user.userId;

            if (!receiverId) {
                return res.status(400).json({ error: "Receiver ID is required" });
            }

            const request = await linkRequestService.sendRequest(requesterId, receiverId);

            // Emit socket event to notify receiver
            const io = req.app.get("io");
            if (io) {
                // Get requester info from main database (we'll need to fetch this)
                // For now, emit with basic info
                io.to(`user:${receiverId}`).emit("linkRequestReceived", {
                    requestId: request._id.toString(),
                    requesterId: requesterId,
                    status: "requested",
                });

                // Update unseen count
                const unseenCount = await linkRequestService.getUnseenRequestCount(receiverId);
                io.to(`user:${receiverId}`).emit("unseenRequestCount", unseenCount);
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

            // Emit socket events
            const io = req.app.get("io");
            if (io) {
                // Notify requester
                io.to(`user:${request.requesterId}`).emit("linkRequestAccepted", {
                    requestId: request._id.toString(),
                    receiverId: request.receiverId,
                });

                // Notify receiver
                io.to(`user:${request.receiverId}`).emit("linkRequestAccepted", {
                    requestId: request._id.toString(),
                    receiverId: request.receiverId,
                });

                // Update unseen count
                const unseenCount = await linkRequestService.getUnseenRequestCount(userId);
                io.to(`user:${userId}`).emit("unseenRequestCount", unseenCount);
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

            // Emit socket events
            const io = req.app.get("io");
            if (io) {
                // Update unseen count
                const unseenCount = await linkRequestService.getUnseenRequestCount(userId);
                io.to(`user:${userId}`).emit("unseenRequestCount", unseenCount);
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

            const status = await linkRequestService.getRequestStatus(requesterId, receiverId);
            res.json({ status });
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

            // Update unseen count
            const io = req.app.get("io");
            if (io) {
                const unseenCount = await linkRequestService.getUnseenRequestCount(userId);
                io.to(`user:${userId}`).emit("unseenRequestCount", unseenCount);
            }

            res.json({ success: true });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
}

module.exports = new LinkRequestController();

