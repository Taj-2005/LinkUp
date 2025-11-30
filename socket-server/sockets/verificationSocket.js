// Email verification socket handler (no auth required - user not logged in yet)
function setupVerificationSockets(io) {
    io.on("connection", (socket) => {
        // Allow connections without JWT for verification purposes
        // User is not logged in yet, so we can't authenticate with JWT
        
        // Join verification room by email
        socket.on("joinVerificationRoom", (data) => {
            const { email } = data;
            if (email) {
                const room = `verification:${email.toLowerCase()}`;
                socket.join(room);
                console.log(`Socket ${socket.id} joined verification room for: ${email}`);
            }
        });

        // Leave verification room
        socket.on("leaveVerificationRoom", (data) => {
            const { email } = data;
            if (email) {
                const room = `verification:${email.toLowerCase()}`;
                socket.leave(room);
                console.log(`Socket ${socket.id} left verification room for: ${email}`);
            }
        });

        // Listen for emailVerified event from Next.js API route (via socket connection)
        socket.on("emailVerified", (data) => {
            const { email } = data;
            if (email) {
                const room = `verification:${email.toLowerCase()}`;
                io.to(room).emit("email-verified", {
                    email: email.toLowerCase(),
                    timestamp: new Date().toISOString(),
                });
                console.log(`Emitted email-verified event to room: ${room}`);
            }
        });

        socket.on("disconnect", () => {
            console.log(`Verification socket disconnected: ${socket.id}`);
        });
    });
}

// Function to emit email verified event (called from HTTP endpoint)
function emitEmailVerified(io, email) {
    if (!io || !email) return;
    
    const room = `verification:${email.toLowerCase()}`;
    io.to(room).emit("email-verified", {
        email: email.toLowerCase(),
        timestamp: new Date().toISOString(),
    });
    
    console.log(`Emitted email-verified event to room: ${room}`);
}

module.exports = { setupVerificationSockets, emitEmailVerified };

