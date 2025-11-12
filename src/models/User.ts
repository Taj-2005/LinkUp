import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
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
    sex?: "male" | "female" | "other";
    createdAt: Date;
    updatedAt: Date;
    refreshToken?: string;
}

const UserSchema: Schema = new Schema<IUser>({
    user_avatar: {
        type: String,
        required: false
    },
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    location: {
        type: String,
        trim: true
    },
    bio: {
        type: String
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    linked_by: {
        type: [String],
        default: []
    },
    linked_to: {
        type: [String],
        default: []
    },
    links: {
        type: [String],
        default: []
    },
    sex: {
        type: String,
        enum: ["male", "female", "other"],
        required: false,
        default: "other"
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    refreshToken: {
        type: String
    }
}, { timestamps: true });

export const User = mongoose.model<IUser>("User", UserSchema);
