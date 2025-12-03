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
    const { userId, actorId, linkId, type, actor, commentId, deepLink } = req.body;

    if (!userId || !actorId || !linkId || !type) {
        return res.status(400).json({ error: "User ID, Actor ID, Link ID, and Type are required" });
    }

    if (io) {
        const authenticatedNamespace = io.of("/");
        const { emitNotificationUpdate } = require("./utils/emitNotificationUpdate");

        authenticatedNamespace.to(`user:${userId}`).emit("notification:new", {
            type,
            linkId,
            actorId,
            timestamp: new Date().toISOString(),
        });

        if (actor && deepLink) {
            authenticatedNamespace.to(`user:${userId}`).emit("interaction:link", {
                type,
                linkId,
                linkOwnerId: userId,
                actor: {
                    _id: actor._id || actorId,
                    username: actor.username || "Unknown",
                    avatar: actor.avatar || actor.user_avatar || null,
                },
                commentId: commentId || undefined,
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

        if (process.env.REDIS_URL) {
            try {
                const { createAdapter } = require("@socket.io/redis-adapter");
                const { createClient } = require("redis");

                const pubClient = createClient({ url: process.env.REDIS_URL });
                const subClient = pubClient.duplicate();

                Promise.all([pubClient.connect(), subClient.connect()]).then(() => {
                    io.adapter(createAdapter(pubClient, subClient));
                    console.log("✓ Redis adapter enabled for Socket.IO clustering (horizontal scalability)");
                }).catch((error) => {
                    console.error("Failed to connect to Redis:", error);
                    console.log("⚠ Socket.IO will run in single-server mode");
                });
            } catch (error) {
                console.error("Redis adapter not available:", error.message);
                console.log("⚠ Install @socket.io/redis-adapter and redis packages for clustering support");
                console.log("  npm install @socket.io/redis-adapter redis");
            }
        } else {
            console.log("ℹ Redis URL not provided - Socket.IO running in single-server mode");
            console.log("  Set REDIS_URL environment variable for horizontal scalability");
        }

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
