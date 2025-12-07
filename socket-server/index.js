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

app.use(cors({
    origin: [process.env.CORS_ORIGIN || "http://localhost:3000", "https://admin.socket.io"],
    credentials: true,
}));
app.use(express.json());

app.use("/api/link-requests", linkRequestRoutes);

app.post("/api/verification/email-verified", (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: "Email is required" });
    }

    if (io) {
        const verificationNamespace = io.of("/verification");
        emitEmailVerified(verificationNamespace, email);
        res.json({ success: true, message: "Verification event emitted" });
    } else {
        res.status(503).json({ error: "Socket.IO not initialized" });
    }
});

app.post("/api/link-requests/link-accepted-notify", async (req, res) => {
    const { requesterId, receiverId } = req.body;

    if (!requesterId || !receiverId) {
        return res.status(400).json({ error: "Requester ID and Receiver ID are required" });
    }

    if (io) {
        const authenticatedNamespace = io.of("/");
        const { emitLinkUpEvent } = require("./utils/emitLinkUpEvent");

        await emitLinkUpEvent(authenticatedNamespace, "accepted", requesterId, receiverId, true);

        res.json({ success: true, message: "Link accepted events emitted" });
    } else {
        res.status(503).json({ error: "Socket.IO not initialized" });
    }
});

app.post("/api/users/profile-updated-notify", (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
    }

    if (io) {
        const authenticatedNamespace = io.of("/");

        authenticatedNamespace.to(`user:${userId}`).emit("userUpdated", {
            userId: userId,
            timestamp: new Date().toISOString(),
        });

        authenticatedNamespace.emit("userUpdated", {
            userId: userId,
            timestamp: new Date().toISOString(),
        });

        console.log(`Emitted profile updated event for user: ${userId}`);
        res.json({ success: true, message: "Profile updated event emitted" });
    } else {
        res.status(503).json({ error: "Socket.IO not initialized" });
    }
});

app.post("/api/link-requests/unlink-notify", async (req, res) => {
    const { currentUserId, otherUserId } = req.body;

    if (!currentUserId || !otherUserId) {
        return res.status(400).json({ error: "User IDs are required" });
    }

    if (io) {
        const authenticatedNamespace = io.of("/");
        const { emitLinkUpEvent } = require("./utils/emitLinkUpEvent");

        await emitLinkUpEvent(authenticatedNamespace, "unlinked", currentUserId, otherUserId, true);

        res.json({ success: true, message: "Unlink events emitted" });
    } else {
        res.status(503).json({ error: "Socket.IO not initialized" });
    }
});

app.post("/api/notifications/interaction-notify", async (req, res) => {
    const { userId, actorId, linkId, type, actor, commentId, deepLink, commentText } = req.body;

    if (!userId || !actorId || !linkId || !type) {
        return res.status(400).json({ error: "User ID, Actor ID, Link ID, and Type are required" });
    }

    if (io) {
        const authenticatedNamespace = io.of("/");
        const { emitNotificationUpdate } = require("./utils/emitNotificationUpdate");

        const timestamp = new Date().toISOString();
        const eventId = `notif-new-${userId}-${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        authenticatedNamespace.to(`user:${userId}`).emit("notification:new", {
            type,
            linkId,
            actorId,
            timestamp,
            eventId,
        });

        if (actor && deepLink) {
            authenticatedNamespace.to(`user:${userId}`).emit("interaction:link", {
                type,
                linkId,
                linkOwnerId: userId,
                actor: {
                    _id: actor._id || actorId,
                    username: actor.username || "Unknown",
                    name: actor.name || undefined,
                    avatar: actor.avatar || actor.user_avatar || null,
                },
                commentId: commentId || undefined,
                commentText: commentText || undefined,
                deepLink: deepLink,
            });

            console.log(`Emitted interaction:link event to user: ${userId} for ${type} by ${actor.username || actorId}`);
        }

        await emitNotificationUpdate(authenticatedNamespace, userId, "create");

        console.log(`Emitted notification:new event to user: ${userId} for ${type} by ${actorId}`);
        res.json({ success: true, message: "Notification event emitted" });
    } else {
        res.status(503).json({ error: "Socket.IO not initialized" });
    }
});

app.post("/api/notifications/update-notify", async (req, res) => {
    const { userId, action, notificationId } = req.body;

    if (!userId || !action) {
        return res.status(400).json({ error: "User ID and Action are required" });
    }

    if (io) {
        const authenticatedNamespace = io.of("/");
        const { emitNotificationUpdate } = require("./utils/emitNotificationUpdate");

        await emitNotificationUpdate(authenticatedNamespace, userId, action, notificationId);

        console.log(`Emitted notification:update event to user: ${userId} for action: ${action}`);
        res.json({ success: true, message: "Notification update event emitted" });
    } else {
        res.status(503).json({ error: "Socket.IO not initialized" });
    }
});

app.post("/api/links/feed-update-notify", (req, res) => {
    const { linkId, userId } = req.body;

    if (!linkId || !userId) {
        return res.status(400).json({ error: "Link ID and User ID are required" });
    }

    if (io) {
        const authenticatedNamespace = io.of("/");
        const timestamp = new Date().toISOString();
        const eventId = `feed-update-${linkId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        authenticatedNamespace.emit("feed:update", {
            linkId,
            userId,
            timestamp,
            eventId,
            type: "newLink",
        });

        console.log(`Emitted feed:update event to ALL connected users for new link: ${linkId} by user: ${userId}`);
        res.json({ success: true, message: "Feed update event emitted to all connected users" });
    } else {
        res.status(503).json({ error: "Socket.IO not initialized" });
    }
});

app.post("/api/links/link-update-notify", (req, res) => {
    const { link } = req.body;

    if (!link || !link._id) {
        return res.status(400).json({ error: "Link data is required" });
    }

    if (io) {
        const authenticatedNamespace = io.of("/");
        const timestamp = new Date().toISOString();
        const eventId = `link-update-${link._id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        authenticatedNamespace.emit("link:update", {
            link,
            timestamp,
            eventId,
        });

        console.log(`Emitted link:update event to ALL connected users for link: ${link._id}`);
        res.json({ success: true, message: "Link update event emitted to all connected users" });
    } else {
        res.status(503).json({ error: "Socket.IO not initialized" });
    }
});

app.get("/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});

let server;
let io;

async function startServer() {
    try {
        await dbConnect();
        console.log("✓ Connected to MongoDB");

        server = app.listen(PORT, () => {
            console.log(`✓ Express server running on port ${PORT}`);
        })

        io = new Server(server, {
            cors: {
                origin: [process.env.CORS_ORIGIN || "http://localhost:3000", "https://admin.socket.io"],
                methods: ["GET", "POST"],
                credentials: true,
            },
            path: "/socket.io",
        });

        console.log("✓ Socket.IO running in single-instance mode");
        console.log("  Caching handled by SWR on frontend");

        app.set("io", io);

        const authenticatedNamespace = io.of("/");

        authenticatedNamespace.use(socketAuthMiddleware);

        setupLinkRequestSockets(authenticatedNamespace);

        const verificationNamespace = io.of("/verification");

        setupVerificationSockets(verificationNamespace);

        if (process.env.ADMIN_UI_USERNAME && process.env.ADMIN_UI_PASSWORD) {
            instrument(io, {
                auth: {
                    type: "basic",
                    username: process.env.ADMIN_UI_USERNAME,
                    password: process.env.ADMIN_UI_PASSWORD,
                },
                mode: process.env.NODE_ENV === "production" ? "production" : "development",
            });
            console.log(`✓ Socket.IO Admin UI enabled at https://admin.socket.io`);
            console.log(`  Username: ${process.env.ADMIN_UI_USERNAME}`);
        } else {
            console.log(`⚠ Socket.IO Admin UI disabled (ADMIN_UI_USERNAME or ADMIN_UI_PASSWORD not set)`);
        }

        console.log(`✓ Socket.IO enabled on /socket.io`);
        console.log(`✓ Verification sockets enabled (no auth required)`);
    } catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
}

startServer();

process.on("SIGTERM", () => {
    console.log("SIGTERM signal received: closing server");
    if (server) {
        server.close(() => {
            console.log("Server closed");
            process.exit(0);
        });
    }
});
