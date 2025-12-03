const mongoose = require("mongoose");

const linkRequestSchema = new mongoose.Schema(
    {
        requesterId: {
            type: String,
            required: true,
            ref: "User",
        },
        receiverId: {
            type: String,
            required: true,
            ref: "User",
        },
        status: {
            type: String,
            enum: ["requested", "accepted", "rejected"],
            default: "requested",
        },
        seen: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

linkRequestSchema.index({ requesterId: 1, receiverId: 1, status: 1 });

module.exports = mongoose.models.LinkRequest || mongoose.model("LinkRequest", linkRequestSchema);
