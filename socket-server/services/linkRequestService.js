const dbConnect = require("../utils/dbConnect");
const LinkRequest = require("../models/LinkRequest");

class LinkRequestService {
    async sendRequest(requesterId, receiverId) {
        await dbConnect();

        // Check if request already exists
        const existingRequest = await LinkRequest.findOne({
            $or: [
                { requesterId, receiverId, status: "requested" },
                { requesterId: receiverId, receiverId: requesterId, status: "requested" },
            ],
        });

        if (existingRequest) {
            throw new Error("Request already exists");
        }

        // Create new request
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

        // Update user arrays in the main database
        // This will be handled by the Next.js API or we can use mongoose directly
        // For now, we'll return the request and let the API handle user updates
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

        // Check if users are already linked by checking User model
        const User = require("../../src/models/User");
        const requester = await User.findById(requesterId);
        
        if (requester) {
            // If requester has receiverId in linked_to, they are linked (requester sees "Linked")
            if (requester.linked_to && requester.linked_to.includes(receiverId)) {
                return "linked";
            }
            // If requester has receiverId in linked_by, they are the receiver (should not see "Linked")
            if (requester.linked_by && requester.linked_by.includes(receiverId)) {
                return "none";
            }
        }

        // Check for existing request
        const request = await LinkRequest.findOne({
            $or: [
                { requesterId, receiverId, status: "requested" },
                { requesterId: receiverId, receiverId: requesterId, status: "requested" },
            ],
        });

        if (request) {
            if (request.requesterId.toString() === requesterId.toString()) {
                return "requested";
            }
            return request.status === "accepted" ? "accepted" : "requested";
        }

        return "none";
    }
}

module.exports = new LinkRequestService();

