const dbConnect = require("../utils/dbConnect");
const LinkRequest = require("../models/LinkRequest");

class LinkRequestService {
    async sendRequest(requesterId, receiverId) {
        await dbConnect();

        const existingRequest = await LinkRequest.findOne({
            $or: [
                { requesterId, receiverId, status: "requested" },
                { requesterId: receiverId, receiverId: requesterId, status: "requested" },
            ],
        });

        if (existingRequest) {
            throw new Error("Request already exists");
        }

        const linkRequest = new LinkRequest({
            requesterId,
            receiverId,
            status: "requested",
            seen: false,
        });

        await linkRequest.save();
        return linkRequest;
    }

    async acceptRequest(requestId, receiverId) {
        await dbConnect();

        const request = await LinkRequest.findById(requestId);
        if (!request) {
            throw new Error("Request not found");
        }

        if (request.receiverId !== receiverId) {
            throw new Error("Unauthorized");
        }

        if (request.status !== "requested") {
            throw new Error("Request already processed");
        }

        request.status = "accepted";
        request.seen = true;
        await request.save();

        return request;
    }

    async rejectRequest(requestId, receiverId) {
        await dbConnect();

        const request = await LinkRequest.findById(requestId);
        if (!request) {
            throw new Error("Request not found");
        }

        if (request.receiverId !== receiverId) {
            throw new Error("Unauthorized");
        }

        if (request.status !== "requested") {
            throw new Error("Request already processed");
        }

        request.status = "rejected";
        request.seen = true;
        await request.save();

        return request;
    }

    async getRequestsForUser(userId) {
        await dbConnect();

        const requests = await LinkRequest.find({
            receiverId: userId,
            status: "requested",
        })
            .sort({ createdAt: -1 });

        return requests;
    }

    async markRequestAsSeen(requestId, userId) {
        await dbConnect();

        const request = await LinkRequest.findById(requestId);
        if (!request || request.receiverId !== userId) {
            return;
        }

        request.seen = true;
        await request.save();
    }

    async getUnseenRequestCount(userId) {
        await dbConnect();

        const count = await LinkRequest.countDocuments({
            receiverId: userId,
            status: "requested",
            seen: false,
        });

        return count;
    }

    async getRequestStatus(requesterId, receiverId) {
        await dbConnect();

        if (!requesterId || !receiverId || requesterId === receiverId) {
            return { status: "none" };
        }

        const mongoose = require("mongoose");

        if (mongoose.connection.readyState !== 1) {
            await dbConnect();
        }

        const requesterObjectId = new mongoose.Types.ObjectId(requesterId);
        const receiverObjectId = new mongoose.Types.ObjectId(receiverId);

        const requester = await mongoose.connection.db.collection("users").findOne({
            _id: requesterObjectId
        });

        if (!requester) {
            return { status: "none" };
        }

        const receiverIdStr = receiverId.toString();
        const requesterIdStr = requesterId.toString();

        const linkedTo = requester.linked_to || [];
        const linkedBy = requester.linked_by || [];

        const isLinkedTo = Array.isArray(linkedTo) && linkedTo.some(id => {
            const idStr = id instanceof mongoose.Types.ObjectId ? id.toString() : String(id);
            return idStr === receiverIdStr;
        });

        const isLinkedBy = Array.isArray(linkedBy) && linkedBy.some(id => {
            const idStr = id instanceof mongoose.Types.ObjectId ? id.toString() : String(id);
            return idStr === receiverIdStr;
        });

        if (isLinkedTo) {
            return { status: "linked" };
        }

        if (isLinkedBy) {
            return { status: "linked-by" };
        }

        const pendingRequest = await LinkRequest.findOne({
            requesterId: requesterIdStr,
            receiverId: receiverIdStr,
            status: "requested",
        });

        if (pendingRequest) {
            return {
                status: "requested",
                requestId: pendingRequest._id.toString()
            };
        }

        const reverseRequest = await LinkRequest.findOne({
            requesterId: receiverIdStr,
            receiverId: requesterIdStr,
            status: "requested",
        });

        if (reverseRequest) {
            return {
                status: "pending",
                requestId: reverseRequest._id.toString()
            };
        }

        return { status: "none" };
    }

    async getBatchRequestStatus(requesterId, targetUserIds) {
        await dbConnect();

        if (!requesterId || !Array.isArray(targetUserIds) || targetUserIds.length === 0) {
            return {};
        }

        const userIds = targetUserIds.slice(0, 1000);

        const validUserIds = userIds.filter(id => id && id !== requesterId);

        if (validUserIds.length === 0) {
            return {};
        }

        const mongoose = require("mongoose");

        if (mongoose.connection.readyState !== 1) {
            await dbConnect();
        }

        const requesterObjectId = new mongoose.Types.ObjectId(requesterId);

        const requester = await mongoose.connection.db.collection("users").findOne({
            _id: requesterObjectId
        });

        if (!requester) {

            return validUserIds.reduce((acc, id) => {
                acc[id] = { status: "none" };
                return acc;
            }, {});
        }

        const requesterIdStr = requesterId.toString();
        const linkedTo = requester.linked_to || [];
        const linkedBy = requester.linked_by || [];

        const targetObjectIds = validUserIds.map(id => new mongoose.Types.ObjectId(id));
        const targetIdStrings = validUserIds.map(id => id.toString());

        const allRequests = await LinkRequest.find({
            $or: [

                {
                    requesterId: requesterIdStr,
                    receiverId: { $in: targetIdStrings },
                    status: "requested",
                },

                {
                    requesterId: { $in: targetIdStrings },
                    receiverId: requesterIdStr,
                    status: "requested",
                },
            ],
        }).lean();

        const statusMap = {};
        validUserIds.forEach(id => {
            statusMap[id] = { status: "none" };
        });

        targetIdStrings.forEach(targetIdStr => {

            const isLinkedTo = Array.isArray(linkedTo) && linkedTo.some(id => {
                const idStr = id instanceof mongoose.Types.ObjectId ? id.toString() : String(id);
                return idStr === targetIdStr;
            });

            const isLinkedBy = Array.isArray(linkedBy) && linkedBy.some(id => {
                const idStr = id instanceof mongoose.Types.ObjectId ? id.toString() : String(id);
                return idStr === targetIdStr;
            });

            if (isLinkedTo) {
                statusMap[targetIdStr] = { status: "linked" };
            } else if (isLinkedBy) {
                statusMap[targetIdStr] = { status: "linked-by" };
            }
        });

        allRequests.forEach(request => {
            const requestRequesterId = request.requesterId.toString();
            const requestReceiverId = request.receiverId.toString();
            const requestId = request._id.toString();

            if (requestRequesterId === requesterIdStr && targetIdStrings.includes(requestReceiverId)) {
                statusMap[requestReceiverId] = {
                    status: "requested",
                    requestId: requestId,
                };
            }

            else if (requestReceiverId === requesterIdStr && targetIdStrings.includes(requestRequesterId)) {
                statusMap[requestRequesterId] = {
                    status: "pending",
                    requestId: requestId,
                };
            }
        });

        const result = {};
        validUserIds.forEach(id => {
            const idStr = id.toString();
            if (statusMap[idStr]) {
                result[idStr] = statusMap[idStr];
            } else {
                result[idStr] = { status: "none" };
            }
        });

        return result;
    }
}

module.exports = new LinkRequestService();
