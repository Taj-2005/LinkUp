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

// Express Middleware
app.use(cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
}));
app.use(express.json());

// Express Routes
app.use("/api/link-requests", linkRequestRoutes);

// Email verification endpoint (called from Next.js API route)
app.post("/api/verification/email-verified", (req, res) => {
    const { email } = req.body;
    
    if (!email) {
        return res.status(400).json({ error: "Email is required" });
    }
    
    // Emit socket event to verification namespace
    if (io) {
        const verificationNamespace = io.of("/verification");
        emitEmailVerified(verificationNamespace, email);
        res.json({ success: true, message: "Verification event emitted" });
    } else {
        res.status(503).json({ error: "Socket.IO not initialized" });
    }
});

// Link accepted notification endpoint (called from Next.js API route)
app.post("/api/link-requests/link-accepted-notify", (req, res) => {
    const { requesterId, receiverId, requestId } = req.body;
    
    if (!requesterId || !receiverId) {
        return res.status(400).json({ error: "Requester ID and Receiver ID are required" });
    }
    
    // Emit socket events to both users for real-time updates
    if (io) {
        const authenticatedNamespace = io.of("/");
        
        // Notify requester (who sent the request)
        authenticatedNamespace.to(`user:${requesterId}`).emit("linkRequestAccepted", {
            requestId: requestId || null,
            requesterId: requesterId,
            receiverId: receiverId,
            timestamp: new Date().toISOString(),
        });
        
        // Notify receiver (who accepted the request)
        authenticatedNamespace.to(`user:${receiverId}`).emit("linkRequestAccepted", {
            requestId: requestId || null,
            requesterId: requesterId,
            receiverId: receiverId,
            timestamp: new Date().toISOString(),
        });
        
        // Emit userUpdated events to trigger user list refresh for both users
        authenticatedNamespace.to(`user:${requesterId}`).emit("userUpdated", {
            userId: requesterId,
        });
        authenticatedNamespace.to(`user:${receiverId}`).emit("userUpdated", {
            userId: receiverId,
        });
        
        console.log(`Emitted link accepted events to users: ${requesterId} and ${receiverId}`);
        res.json({ success: true, message: "Link accepted events emitted" });
    } else {
        res.status(503).json({ error: "Socket.IO not initialized" });
    }
});

// Profile updated notification endpoint (called from Next.js API route)
app.post("/api/users/profile-updated-notify", (req, res) => {
    const { userId } = req.body;
    
    if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
    }
    
    // Emit socket events to notify all connected clients about profile update
    if (io) {
        const authenticatedNamespace = io.of("/");
        
        // Emit userUpdated event to the specific user who was updated
        // This ensures their current user data refreshes immediately
        authenticatedNamespace.to(`user:${userId}`).emit("userUpdated", {
            userId: userId,
            timestamp: new Date().toISOString(),
        });
        
        // Also emit to all users to refresh the all users list
        // This ensures everyone sees the updated profile information
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

// Unlink notification endpoint (called from Next.js API route)
app.post("/api/link-requests/unlink-notify", (req, res) => {
    const { currentUserId, otherUserId } = req.body;
    
    if (!currentUserId || !otherUserId) {
        return res.status(400).json({ error: "User IDs are required" });
    }
    
    // Emit socket events to both users for real-time updates
    if (io) {
        const authenticatedNamespace = io.of("/");
        
        // Notify current user (who performed the unlink)
        authenticatedNamespace.to(`user:${currentUserId}`).emit("userUnlinked", {
            userId: otherUserId,
            timestamp: new Date().toISOString(),
        });
        
        // Notify other user (who was unlinked)
        authenticatedNamespace.to(`user:${otherUserId}`).emit("userUnlinked", {
            userId: currentUserId,
            timestamp: new Date().toISOString(),
        });
        
        // Emit userUpdated events to trigger user list refresh for both users
        authenticatedNamespace.to(`user:${currentUserId}`).emit("userUpdated", {
            userId: currentUserId,
        });
        authenticatedNamespace.to(`user:${otherUserId}`).emit("userUpdated", {
            userId: otherUserId,
        });
        
        console.log(`Emitted unlink events to users: ${currentUserId} and ${otherUserId}`);
        res.json({ success: true, message: "Unlink events emitted" });
    } else {
        res.status(503).json({ error: "Socket.IO not initialized" });
    }
});

// Health check
app.get("/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Create server using Express's listen (returns HTTP server)
// Note: Socket.IO requires an HTTP server, which Express provides internally
let server;
let io;

// Connect to database and start server
async function startServer() {
    try {
        await dbConnect();
        console.log("✓ Connected to MongoDB");

        // Start Express server and get the HTTP server instance
        server = app.listen(PORT, () => {
            console.log(`✓ Express server running on port ${PORT}`);
            console.log(`✓ CORS enabled for: ${process.env.CORS_ORIGIN || "http://localhost:3000"}`);
        })
        
        // Initialize Socket.IO with Express's HTTP server
        io = new Server(server, {
            cors: {
                origin: process.env.CORS_ORIGIN || "http://localhost:3000",
                methods: ["GET", "POST"],
                credentials: true,
            },
            path: "/socket.io",
        });

        // Store io instance for use in controllers
        app.set("io", io);

        // Create a namespace for authenticated connections (link requests, etc.)
        const authenticatedNamespace = io.of("/");
        
        // Apply auth middleware only to authenticated namespace
        authenticatedNamespace.use(socketAuthMiddleware);

        // Setup authenticated socket handlers (link requests)
        setupLinkRequestSockets(authenticatedNamespace);

        // Create a separate namespace for verification (no auth required)
        const verificationNamespace = io.of("/verification");
        
        // Setup verification sockets (no auth required - user not logged in yet)
        setupVerificationSockets(verificationNamespace);

        // Setup Socket.IO Admin UI (with authentication)
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

// Graceful shutdown
process.on("SIGTERM", () => {
    console.log("SIGTERM signal received: closing server");
    if (server) {
        server.close(() => {
            console.log("Server closed");
            process.exit(0);
        });
    }
});

