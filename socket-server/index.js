require("dotenv").config();
const express = require("express");
const { Server } = require("socket.io");
const cors = require("cors");
const dbConnect = require("./utils/dbConnect");
const { socketAuthMiddleware } = require("./utils/auth");
const linkRequestRoutes = require("./routes/linkRequestRoutes");
const setupLinkRequestSockets = require("./sockets/linkRequestSocket");

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
        }).on("error", (err) => {
            if (err.code === "EADDRINUSE") {
                console.error(`\n✗ Port ${PORT} is already in use.`);
                console.error(`  Please stop the process using port ${PORT} or change the PORT in .env file.\n`);
                console.error(`  To find and kill the process:`);
                console.error(`  lsof -ti:${PORT} | xargs kill -9\n`);
            } else {
                console.error("Server error:", err);
            }
            process.exit(1);
        });

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

        // Socket.IO authentication middleware
        io.use(socketAuthMiddleware);

        // Setup socket event handlers
        setupLinkRequestSockets(io);

        console.log(`✓ Socket.IO enabled on /socket.io`);
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

