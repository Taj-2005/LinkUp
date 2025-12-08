require("dotenv").config();
const express = require("express");
const { Server } = require("socket.io");
const { instrument } = require("@socket.io/admin-ui");
const cors = require("cors");
const dbConnect = require("./utils/dbConnect");
const { socketAuthMiddleware } = require("./utils/auth");
const linkRequestRoutes = require("./routes/linkRequestRoutes");
const setupLinkRequestSockets = require("./sockets/linkRequestSocket");
const { setupVerificationSockets, emitEmailVerified } = require("./sockets/verificationSocket");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(
    cors({
        origin: [process.env.CORS_ORIGIN || "http://localhost:3000", "https://admin.socket.io"],
        credentials: true,
    })
);

app.use(express.json());
app.use("/api/link-requests", linkRequestRoutes);

app.post("/api/verification/email-verified", (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });
    if (!io) return res.status(503).json({ error: "Socket.IO not initialized" });

    emitEmailVerified(io.of("/verification"), email);
    res.json({ success: true, message: "Verification event emitted" });
});

app.post("/api/link-requests/link-accepted-notify", async (req, res) => {
    const { requesterId, receiverId } = req.body;
    if (!requesterId || !receiverId) return res.status(400).json({ error: "Requester ID and Receiver ID are required" });
    if (!io) return res.status(503).json({ error: "Socket.IO not initialized" });

    const authenticatedNamespace = io.of("/");
    const { emitLinkUpEvent } = require("./utils/emitLinkUpEvent");
    await emitLinkUpEvent(authenticatedNamespace, "accepted", requesterId, receiverId, true);

    res.json({ success: true, message: "Link accepted events emitted" });
});

app.post("/api/users/profile-updated-notify", (req, res) => {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: "User ID is required" });
    if (!io) return res.status(503).json({ error: "Socket.IO not initialized" });

    const ns = io.of("/");
    const timestamp = new Date().toISOString();

    ns.to(`user:${userId}`).emit("userUpdated", { userId, timestamp });
    ns.emit("userUpdated", { userId, timestamp });

    res.json({ success: true, message: "Profile updated event emitted" });
});

app.post("/api/link-requests/unlink-notify", async (req, res) => {
    const { currentUserId, otherUserId } = req.body;
    if (!currentUserId || !otherUserId) return res.status(400).json({ error: "User IDs are required" });
    if (!io) return res.status(503).json({ error: "Socket.IO not initialized" });

    const ns = io.of("/");
    const { emitLinkUpEvent } = require("./utils/emitLinkUpEvent");
    await emitLinkUpEvent(ns, "unlinked", currentUserId, otherUserId, true);

    res.json({ success: true, message: "Unlink events emitted" });
});

app.post("/api/links/link-deleted-notify", (req, res) => {
    const { linkId, ownerId, updatedOwner, timestamp } = req.body;
    if (!linkId || !ownerId) return res.status(400).json({ error: "Link ID and Owner ID are required" });
    if (!io) return res.status(503).json({ error: "Socket.IO not initialized" });

    const ns = io.of("/");
    const eventId = `link-deleted-${linkId}-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;

    ns.emit("link:deleted", {
        linkId,
        ownerId,
        updatedOwner,
        timestamp: timestamp || new Date().toISOString(),
        eventId,
    });

    res.json({ success: true, message: "Link deleted event emitted" });
});

app.post("/api/links/link-created-notify", (req, res) => {
    const { link, actor, timestamp } = req.body;
    if (!link || !actor) return res.status(400).json({ error: "Link and Actor are required" });
    if (!io) return res.status(503).json({ error: "Socket.IO not initialized" });

    const ns = io.of("/");
    const eventId = `link-created-${link._id}-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;

    ns.emit("link:created", {
        link,
        actor,
        timestamp: timestamp || new Date().toISOString(),
        eventId,
    });

    res.json({ success: true, message: "Link created event emitted" });
});

app.post("/api/notifications/interaction-notify", async (req, res) => {
    const { userId, actorId, linkId, type, actor, commentId, deepLink, commentText } = req.body;
    if (!userId || !actorId || !linkId || !type) return res.status(400).json({ error: "User ID, Actor ID, Link ID, and Type are required" });
    if (String(userId) === String(actorId)) return res.json({ success: true, message: "Self-notification skipped" });
    if (!io) return res.status(503).json({ error: "Socket.IO not initialized" });

    const ns = io.of("/");
    const { emitNotificationUpdate } = require("./utils/emitNotificationUpdate");
    const timestamp = new Date().toISOString();
    const eventId = `notif-new-${userId}-${type}-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;

    ns.to(`user:${userId}`).emit("notification:new", { type, linkId, actorId, timestamp, eventId });

    if (actor && deepLink) {
        ns.to(`user:${userId}`).emit("interaction:link", {
            type,
            linkId,
            linkOwnerId: userId,
            actor: {
                _id: actor._id || actorId,
                username: actor.username || "Unknown",
                name: actor.name,
                avatar: actor.avatar || actor.user_avatar || null,
            },
            commentId,
            commentText,
            deepLink,
        });
    }

    await emitNotificationUpdate(ns, userId, "create");
    res.json({ success: true, message: "Notification event emitted" });
});

app.post("/api/notifications/update-notify", async (req, res) => {
    const { userId, action, notificationId } = req.body;
    if (!userId || !action) return res.status(400).json({ error: "User ID and Action are required" });
    if (!io) return res.status(503).json({ error: "Socket.IO not initialized" });

    const ns = io.of("/");
    const { emitNotificationUpdate } = require("./utils/emitNotificationUpdate");

    await emitNotificationUpdate(ns, userId, action, notificationId);
    res.json({ success: true, message: "Notification update event emitted" });
});

app.post("/api/links/feed-update-notify", (req, res) => {
    const { linkId, userId } = req.body;
    if (!linkId || !userId) return res.status(400).json({ error: "Link ID and User ID are required" });
    if (!io) return res.status(503).json({ error: "Socket.IO not initialized" });

    const ns = io.of("/");
    const timestamp = new Date().toISOString();
    const eventId = `feed-update-${linkId}-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;

    ns.emit("feed:update", { linkId, userId, timestamp, eventId, type: "newLink" });
    res.json({ success: true, message: "Feed update event emitted to all connected users" });
});

app.post("/api/links/link-update-notify", (req, res) => {
    const { link } = req.body;
    if (!link || !link._id) return res.status(400).json({ error: "Link data is required" });
    if (!io) return res.status(503).json({ error: "Socket.IO not initialized" });

    const ns = io.of("/");
    const timestamp = new Date().toISOString();
    const eventId = `link-update-${link._id}-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;

    ns.emit("link:update", { link, timestamp, eventId });
    res.json({ success: true, message: "Link update event emitted" });
});

app.get("/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});

let server;
let io;

async function startServer() {
    try {
        await dbConnect();

        server = app.listen(PORT, () => {
            console.log(`✓ Express server running on port ${PORT}`);
        });

        io = new Server(server, {
            cors: {
                origin: [process.env.CORS_ORIGIN || "http://localhost:3000", "https://admin.socket.io"],
                methods: ["GET", "POST"],
                credentials: true,
            },
            path: "/socket.io",
        });

        app.set("io", io);

        const authenticatedNamespace = io.of("/");
        authenticatedNamespace.use(socketAuthMiddleware);

        setupLinkRequestSockets(authenticatedNamespace);
        setupVerificationSockets(io.of("/verification"));

        if (process.env.ADMIN_UI_USERNAME && process.env.ADMIN_UI_PASSWORD) {
            instrument(io, {
                auth: {
                    type: "basic",
                    username: process.env.ADMIN_UI_USERNAME,
                    password: process.env.ADMIN_UI_PASSWORD,
                },
                mode: process.env.NODE_ENV === "production" ? "production" : "development",
            });
        }
    } catch (err) {
        console.error("Failed to start server:", err);
        process.exit(1);
    }
}

startServer();

process.on("SIGTERM", () => {
    if (server) {
        server.close(() => process.exit(0));
    }
});
