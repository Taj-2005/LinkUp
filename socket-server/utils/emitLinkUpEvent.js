const dbConnect = require("../utils/dbConnect");
const mongoose = require("mongoose");

async function getUserProfile(userId) {
    try {
        await dbConnect();
        const User = mongoose.connection.db.collection("users");
        const user = await User.findOne(
            { _id: new mongoose.Types.ObjectId(userId) },
            { projection: { name: 1, username: 1, user_avatar: 1 } }
        );
        return user ? {
            name: user.name || "",
            username: user.username || "",
            user_avatar: user.user_avatar || "",
        } : { name: "", username: "", user_avatar: "" };
    } catch (error) {
        console.error("Error fetching user profile:", error);
        return { name: "", username: "", user_avatar: "" };
    }
}

async function emitLinkUpEvent(io, type, userA, userB, emitGlobal = false) {
    if (!io || !type || !userA || !userB) {
        console.error("Invalid LinkUp event emission:", { io: !!io, type, userA, userB });
        return;
    }

    const [userAInfo, userBInfo] = await Promise.all([
        getUserProfile(userA),
        getUserProfile(userB),
    ]);

    const eventData = {
        type: type,
        from: userA,
        to: userB,
        fromUser: {
            name: userAInfo.name,
            username: userAInfo.username,
            user_avatar: userAInfo.user_avatar,
        },
        toUser: {
            name: userBInfo.name,
            username: userBInfo.username,
            user_avatar: userBInfo.user_avatar,
        },
        timestamp: Date.now(),
    };

    io.to(`user:${userA}`).emit("linkup", eventData);
    io.to(`user:${userB}`).emit("linkup", eventData);

    const eventName = `linkup:${type}`;
    io.to(`user:${userA}`).emit(eventName, {
        from: userA,
        to: userB,
        fromUser: eventData.fromUser,
        toUser: eventData.toUser,
    });
    io.to(`user:${userB}`).emit(eventName, {
        from: userA,
        to: userB,
        fromUser: eventData.fromUser,
        toUser: eventData.toUser,
    });

    if (emitGlobal) {
        io.emit("global:linkup", {
            type: type,
            userA: userA,
            userB: userB,
            timestamp: Date.now(),
        });
    }

    console.log(`✓ Emitted linkup:${type} to users: ${userA} and ${userB}${emitGlobal ? " (+ global)" : ""}`);
}

module.exports = {
    emitLinkUpEvent,
};
