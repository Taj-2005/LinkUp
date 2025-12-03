import mongoose, { Document, Schema } from "mongoose";

export type NotificationType = "comment" | "reply" | "like" | "save";

export interface INotification extends Document {
  _id: string;
  userId: string;
  actorId: string;
  linkId: string;
  type: NotificationType;
  commentId?: string;
  replyId?: string;
  deepLink?: string;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema: Schema = new Schema<INotification>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    actorId: {
      type: String,
      required: true,
    },
    linkId: {
      type: String,
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["comment", "reply", "like", "save"],
      required: true,
    },
    commentId: {
      type: String,
      required: false,
    },
    replyId: {
      type: String,
      required: false,
    },
    deepLink: {
      type: String,
      required: false,
    },
    read: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true }
);

NotificationSchema.index({ userId: 1, read: 1, createdAt: -1 });

NotificationSchema.index({ userId: 1, linkId: 1, actorId: 1, type: 1 });

export const Notification =
  mongoose.models.Notification ||
  mongoose.model<INotification>("Notification", NotificationSchema);
