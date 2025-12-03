import mongoose, { Document, Schema } from "mongoose";

export interface IComment extends Document {
  _id: string;
  userId: string;
  username: string;
  user_avatar?: string;
  text: string;
  replies: IReply[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IReply extends Document {
  _id: string;
  userId: string;
  username: string;
  user_avatar?: string;
  text: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ILink extends Document {
  _id: string;
  userId: string;
  imageUrl: string;
  description?: string;
  location?: string;
  likes: string[];
  comments: IComment[];
  createdAt: Date;
  updatedAt: Date;
}

const ReplySchema: Schema = new Schema<IReply>(
  {
    userId: { type: String, required: true },
    username: { type: String, required: true },
    user_avatar: { type: String },
    text: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

const CommentSchema: Schema = new Schema<IComment>(
  {
    userId: { type: String, required: true },
    username: { type: String, required: true },
    user_avatar: { type: String },
    text: { type: String, required: true, trim: true },
    replies: { type: [ReplySchema], default: [] },
  },
  { timestamps: true }
);

const LinkSchema: Schema = new Schema<ILink>(
  {
    userId: { type: String, required: true, index: true },
    imageUrl: { type: String, required: true },
    description: { type: String, trim: true, maxlength: 2200 },
    location: { type: String, trim: true, maxlength: 100 },
    likes: { type: [String], default: [] },
    comments: { type: [CommentSchema], default: [] },
  },
  { timestamps: true }
);

LinkSchema.index({ userId: 1, createdAt: -1 });

export const Link =
  mongoose.models.Link || mongoose.model<ILink>("Link", LinkSchema);
