const linkRequestService = require("../services/linkRequestService");
const { emitLinkUpEvent } = require("../utils/emitLinkUpEvent");
const { emitCombinedUnseenCount } = require("../utils/emitNotificationUpdate");

function setupLinkRequestSockets(io) {
    io.on("connection", (socket) => {
        const userId = socket.data.user?.userId;
        if (!userId) {
            socket.disconnect();
            return;
        }

        socket.join(`user:${userId}`);

        console.log(`User connected: ${userId} (${socket.id})`);

        socket.on("sendLinkRequest", async (data) => {
            try {
                const { receiverId } = data;
                if (!receiverId) {
                    socket.emit("error", { message: "Receiver ID is required" });
                    return;
                }

                const request = await linkRequestService.sendRequest(userId, receiverId);

                await emitLinkUpEvent(io, "requested", userId, receiverId, false);

                const unseenRequestCount = await linkRequestService.getUnseenRequestCount(receiverId);
                await emitCombinedUnseenCount(io, receiverId, unseenRequestCount);
            } catch (error) {
                socket.emit("error", { message: error.message });
            }
        });

        socket.on("acceptLinkRequest", async (data) => {
            try {
                const { requestId } = data;
                if (!requestId) {
                    socket.emit("error", { message: "Request ID is required" });
                    return;
                }

                const request = await linkRequestService.acceptRequest(requestId, userId);

                const requesterId = request.requesterId.toString();
                const receiverId = request.receiverId.toString();

                await emitLinkUpEvent(io, "accepted", requesterId, receiverId, true);

                const unseenRequestCount = await linkRequestService.getUnseenRequestCount(userId);
                await emitCombinedUnseenCount(io, userId, unseenRequestCount);
            } catch (error) {
                socket.emit("error", { message: error.message });
            }
        });

        socket.on("rejectLinkRequest", async (data) => {
            try {
                const { requestId } = data;
                if (!requestId) {
                    socket.emit("error", { message: "Request ID is required" });
                    return;
                }

                const request = await linkRequestService.rejectRequest(requestId, userId);

                const requesterId = request.requesterId.toString();
                const receiverId = request.receiverId.toString();

                await emitLinkUpEvent(io, "rejected", requesterId, receiverId, false);

                const unseenRequestCount = await linkRequestService.getUnseenRequestCount(userId);
                await emitCombinedUnseenCount(io, userId, unseenRequestCount);
            } catch (error) {
                socket.emit("error", { message: error.message });
            }
        });

        socket.on("getUnseenCount", async () => {
            try {
                const linkRequestCount = await linkRequestService.getUnseenRequestCount(userId);

                await emitCombinedUnseenCount(io, userId, linkRequestCount);
            } catch (error) {
                console.error("Error getting unseen count:", error);
            }
        });

        socket.on("markRequestAsSeen", async (data) => {
            try {
                const { requestId } = data;
                if (!requestId) return;

                await linkRequestService.markRequestAsSeen(requestId, userId);

                const unseenRequestCount = await linkRequestService.getUnseenRequestCount(userId);
                await emitCombinedUnseenCount(io, userId, unseenRequestCount);
            } catch (error) {
                console.error("Error marking as seen:", error);
            }
        });

        socket.on("cancelLinkRequest", async (data) => {
            try {
                const { receiverId } = data;
                if (!receiverId) {
                    socket.emit("error", { message: "Receiver ID is required" });
                    return;
                }

                await emitLinkUpEvent(io, "canceled", userId, receiverId, false);
            } catch (error) {
                socket.emit("error", { message: error.message });
            }
        });

        socket.on("unlink", async (data) => {
            try {
                const { otherUserId } = data;
                if (!otherUserId) {
                    socket.emit("error", { message: "Other user ID is required" });
                    return;
                }

                await emitLinkUpEvent(io, "unlinked", userId, otherUserId, true);
            } catch (error) {
                socket.emit("error", { message: error.message });
            }
        });

        socket.on("disconnect", () => {
            console.log(`User disconnected: ${userId} (${socket.id})`);
        });
    });
}

module.exports = setupLinkRequestSockets;
