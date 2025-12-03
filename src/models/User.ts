import mongoose, { Document, Schema } from "mongoose";

export interface RefreshToken {
    token: string;
    deviceId: string;
    createdAt: Date;
}

export interface IUser extends Document {
    _id: string;
    user_avatar?: string;
    username: string;
    name: string;
    location?: string;
    bio?: string;
    email: string;
    password: string;
    linked_to: string[];
    linked_by: string[];
    links: string[];
    savedLinks: string[];
    sex?: "male" | "female" | "other";
    isVerified: boolean;
    verificationToken?: string;
    verificationTokenExpiry?: Date;
    createdAt: Date;
    updatedAt: Date;
    refreshToken?: string;
    refreshTokens?: RefreshToken[];

    resetToken?: string;
    resetTokenExpiry?: number;
}

const UserSchema: Schema = new Schema<IUser>(
    {
        user_avatar: { type: String },
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
        },
        name: { type: String, required: true, trim: true },
        location: { type: String, trim: true },
        bio: { type: String },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
        },
        password: { type: String, required: true },

        linked_by: { type: [String], default: [] },
        linked_to: { type: [String], default: [] },
        links: { type: [String], default: [] },
        savedLinks: { type: [String], default: [] },

        sex: {
            type: String,
            enum: ["male", "female", "other"],
            default: "other",
        },

        isVerified: { type: Boolean, default: false },

        verificationToken: { type: String },
        verificationTokenExpiry: { type: Date },

        refreshToken: { type: String },
        refreshTokens: [{
            token: { type: String, required: true },
            deviceId: { type: String, required: true },
            createdAt: { type: Date, default: Date.now }
        }],

        resetToken: { type: String },
        resetTokenExpiry: { type: Number },
    },
    { timestamps: true }
);

export const User =
    mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
