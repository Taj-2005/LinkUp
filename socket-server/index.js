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

