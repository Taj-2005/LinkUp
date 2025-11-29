const jwt = require("jsonwebtoken");

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;

if (!JWT_ACCESS_SECRET) {
    throw new Error("JWT_ACCESS_SECRET not set in environment variables");
}

function verifyToken(token) {
    try {
        return jwt.verify(token, JWT_ACCESS_SECRET);
    } catch (error) {
        return null;
    }
}

function socketAuthMiddleware(socket, next) {
    const token = socket.handshake.auth.token || 
                  socket.handshake.headers.authorization?.replace("Bearer ", "");

    if (!token) {
        return next(new Error("Authentication error: No token provided"));
    }

    const payload = verifyToken(token);
    if (!payload) {
        return next(new Error("Authentication error: Invalid token"));
    }

    socket.data.user = payload;
    next();
}

module.exports = { verifyToken, socketAuthMiddleware };

