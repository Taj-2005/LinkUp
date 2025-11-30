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

        // FIRST: Check for existing pending request where current user is the requester
        // This is the most important check - if user sent a request, show "requested"
        const pendingRequest = await LinkRequest.findOne({
            requesterId: requesterId,
            receiverId: receiverId,
            status: "requested",
        });

        if (pendingRequest) {
            return "requested";
        }

        // SECOND: Check if users are already linked by querying User collection directly
        // Since we can't require TypeScript models, we use mongoose to query the collection
        const mongoose = require("mongoose");
        
        // Ensure connection is ready
        if (mongoose.connection.readyState !== 1) {
            await dbConnect();
        }
        
        const requester = await mongoose.connection.db.collection("users").findOne({
            _id: new mongoose.Types.ObjectId(requesterId)
        });
        
        if (requester) {
            // Convert receiverId to string for comparison (MongoDB stores as ObjectId)
            const receiverIdStr = receiverId.toString();
            
            // If requester has receiverId in linked_to, they are linked (requester sees "Linked")
            const linkedTo = requester.linked_to || [];
            if (Array.isArray(linkedTo) && linkedTo.some(id => {
                const idStr = id instanceof mongoose.Types.ObjectId ? id.toString() : String(id);
                return idStr === receiverIdStr;
            })) {
                return "linked";
            }
            // If requester has receiverId in linked_by, they are already linked (receiver sent request)
            // In this case, they're linked, so don't show "requested"
            const linkedBy = requester.linked_by || [];
            if (Array.isArray(linkedBy) && linkedBy.some(id => {
                const idStr = id instanceof mongoose.Types.ObjectId ? id.toString() : String(id);
                return idStr === receiverIdStr;
            })) {
                return "none";
            }
        }

        // THIRD: Check for any other pending requests (e.g., receiver sent request to requester)
        // This is less common but should be checked
        const reverseRequest = await LinkRequest.findOne({
            requesterId: receiverId,
            receiverId: requesterId,
            status: "requested",
        });

        if (reverseRequest) {
            // If receiver sent request to requester, requester should see "LinkUp" (not "requested")
            // The "requested" status is only shown when the current user is the requester
            return "none";
        }

        return "none";
    }
}

module.exports = new LinkRequestService();

