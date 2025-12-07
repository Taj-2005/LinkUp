const dbConnect = require("../utils/dbConnect");
const mongoose = require("mongoose");

async function emitNotificationUpdate(io, userId, action, notificationId = null) {
    try {
        await dbConnect();

        const Notification = mongoose.models.Notification ||
            mongoose.model("Notification", new mongoose.Schema({}, { strict: false }));

        const LinkRequest = mongoose.models.LinkRequest ||
            mongoose.model("LinkRequest", new mongoose.Schema({}, { strict: false }));

        const [notificationCount, linkRequestCount] = await Promise.all([
            Notification.countDocuments({
                userId: userId,
                read: false,
            }),
            LinkRequest.countDocuments({
                receiverId: userId,
                status: "requested",
                seen: false,
            }),
        ]);

        const combinedCount = notificationCount + linkRequestCount;
        const timestamp = new Date().toISOString();
        const eventId = `notif-update-${userId}-${action}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        io.to(`user:${userId}`).emit("notification:update", {
            userId,
            unseenCount: notificationCount,
            action,
            notificationId,
            timestamp,
            eventId,
        });

        io.to(`user:${userId}`).emit("unseenCount:update", {
            userId,
            unseenCount: combinedCount,
            notificationCount,
            linkRequestCount,
            timestamp,
            eventId: `unseen-${eventId}`,
        });

        console.log(`Emitted notification:update to user:${userId} - notificationCount: ${notificationCount}, combinedCount: ${combinedCount}, action: ${action}`);
    } catch (error) {
        console.error("Error emitting notification update:", error);

    }
}
        
async function emitCombinedUnseenCount(io, userId, linkRequestCount = null) {
    try {
        await dbConnect();

        const Notification = mongoose.models.Notification ||
            mongoose.model("Notification", new mongoose.Schema({}, { strict: false }));

        const LinkRequest = mongoose.models.LinkRequest ||
            mongoose.model("LinkRequest", new mongoose.Schema({}, { strict: false }));

        const [notificationCount, actualLinkRequestCount] = await Promise.all([
            Notification.countDocuments({
                userId: userId,
                read: false,
            }),
            linkRequestCount !== null
                ? Promise.resolve(linkRequestCount)
                : LinkRequest.countDocuments({
                    receiverId: userId,
                    status: "requested",
                    seen: false,
                }),
        ]);

        const combinedCount = notificationCount + actualLinkRequestCount;
        const timestamp = new Date().toISOString();
        const eventId = `unseen-count-${userId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        io.to(`user:${userId}`).emit("unseenCount:update", {
            userId,
            unseenCount: combinedCount,
            notificationCount,
            linkRequestCount: actualLinkRequestCount,
            timestamp,
            eventId,
        });

        console.log(`Emitted unseenCount:update to user:${userId} - total: ${combinedCount} (notifications: ${notificationCount}, linkRequests: ${actualLinkRequestCount})`);
    } catch (error) {
        console.error("Error emitting combined unseen count:", error);

    }
}

module.exports = {
    emitNotificationUpdate,
    emitCombinedUnseenCount,
};
