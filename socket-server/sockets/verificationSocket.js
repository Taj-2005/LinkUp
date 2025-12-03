function setupVerificationSockets(io) {
    io.on("connection", (socket) => {

        socket.on("joinVerificationRoom", (data) => {
            const { email } = data;
            if (email) {
                const room = `verification:${email.toLowerCase()}`;
                socket.join(room);
                console.log(`Socket ${socket.id} joined verification room for: ${email}`);
            }
        });

        socket.on("leaveVerificationRoom", (data) => {
            const { email } = data;
            if (email) {
                const room = `verification:${email.toLowerCase()}`;
                socket.leave(room);
                console.log(`Socket ${socket.id} left verification room for: ${email}`);
            }
        });

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
