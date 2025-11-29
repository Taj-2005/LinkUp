const linkRequestService = require("../services/linkRequestService");

function setupLinkRequestSockets(io) {
    io.on("connection", (socket) => {
        const userId = socket.data.user?.userId;
        if (!userId) {
            socket.disconnect();
            return;
        }

        // Join user's personal room
        socket.join(`user:${userId}`);

        console.log(`User connected: ${userId} (${socket.id})`);

        // Handle send link request
        socket.on("sendLinkRequest", async (data) => {
            try {
                const { receiverId } = data;
                if (!receiverId) {
                    socket.emit("error", { message: "Receiver ID is required" });
                    return;
                }

                const request = await linkRequestService.sendRequest(userId, receiverId);

                // Fetch requester info from main database
                // Note: This requires access to the User model from the main app
                // For now, we'll emit with just the ID and let the frontend fetch details
                // In production, you might want to share the User model or create an API endpoint
                io.to(`user:${receiverId}`).emit("linkRequestReceived", {
                    requestId: request._id.toString(),
                    requesterId: userId,
                    status: "requested",
                });

                // Update unseen count for receiver
                const unseenCount = await linkRequestService.getUnseenRequestCount(receiverId);
                io.to(`user:${receiverId}`).emit("unseenRequestCount", unseenCount);

                socket.emit("linkRequestSent", { success: true });
            } catch (error) {
                socket.emit("error", { message: error.message });
            }
        });

        // Handle accept link request
        socket.on("acceptLinkRequest", async (data) => {
            try {
                const { requestId } = data;
                if (!requestId) {
                    socket.emit("error", { message: "Request ID is required" });
                    return;
                }

                const request = await linkRequestService.acceptRequest(requestId, userId);

                // Notify requester (the person who sent the request)
                io.to(`user:${request.requesterId}`).emit("linkRequestAccepted", {
                    requestId: request._id.toString(),
                    receiverId: request.receiverId.toString(), // Person who accepted
                });

                // Notify receiver (the person who accepted)
                socket.emit("linkRequestAccepted", {
                    requestId: request._id.toString(),
                    receiverId: request.receiverId.toString(),
                });

                // Update unseen count
                const unseenCount = await linkRequestService.getUnseenRequestCount(userId);
                io.to(`user:${userId}`).emit("unseenRequestCount", unseenCount);
            } catch (error) {
                socket.emit("error", { message: error.message });
            }
        });

        // Handle reject link request
        socket.on("rejectLinkRequest", async (data) => {
            try {
                const { requestId } = data;
                if (!requestId) {
                    socket.emit("error", { message: "Request ID is required" });
                    return;
                }

                await linkRequestService.rejectRequest(requestId, userId);

                // Update unseen count
                const unseenCount = await linkRequestService.getUnseenRequestCount(userId);
                io.to(`user:${userId}`).emit("unseenRequestCount", unseenCount);

                socket.emit("linkRequestRejected", { success: true });
            } catch (error) {
                socket.emit("error", { message: error.message });
            }
        });

        // Handle get unseen count
        socket.on("getUnseenCount", async () => {
            try {
                const count = await linkRequestService.getUnseenRequestCount(userId);
                socket.emit("unseenRequestCount", count);
            } catch (error) {
                console.error("Error getting unseen count:", error);
            }
        });

        // Handle mark as seen
        socket.on("markRequestAsSeen", async (data) => {
            try {
                const { requestId } = data;
                if (!requestId) return;

                await linkRequestService.markRequestAsSeen(requestId, userId);

                // Update unseen count
                const unseenCount = await linkRequestService.getUnseenRequestCount(userId);
                io.to(`user:${userId}`).emit("unseenRequestCount", unseenCount);
            } catch (error) {
                console.error("Error marking as seen:", error);
            }
        });

        // Handle unlink
        socket.on("unlink", async (data) => {
            try {
                const { otherUserId } = data;
                if (!otherUserId) {
                    socket.emit("error", { message: "Other user ID is required" });
                    return;
                }

                // Unlink logic will be handled by Next.js API
                // Just emit the event
                io.to(`user:${otherUserId}`).emit("unlinked", {
                    userId: userId,
                });

                socket.emit("unlinked", { success: true });
            } catch (error) {
                socket.emit("error", { message: error.message });
            }
        });

        // Handle disconnect
        socket.on("disconnect", () => {
            console.log(`User disconnected: ${userId} (${socket.id})`);
        });
    });
}

module.exports = setupLinkRequestSockets;

