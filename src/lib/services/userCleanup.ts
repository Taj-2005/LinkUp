import { dbConnect } from "@/lib/dbConnect";
import { User } from "@/models/User";
import { Link } from "@/models/Link";
import { Notification } from "@/models/Notification";
import mongoose from "mongoose";

const BATCH_SIZE = 1000;
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export interface CleanupResult {
  deletedCount: number;
  deletedLinksCount: number;
  deletedNotificationsCount: number;
  deletedLinkRequestsCount: number;
  updatedUsersCount: number;
}

export async function cleanupUnverifiedUsers(): Promise<CleanupResult> {
  await dbConnect();

  const cutoffDate = new Date(Date.now() - SEVEN_DAYS_MS);

  const unverifiedUsers = await User.find({
    isVerified: { $ne: true },
    createdAt: { $lt: cutoffDate },
  })
    .select("_id")
    .lean();

  if (unverifiedUsers.length === 0) {
    return {
      deletedCount: 0,
      deletedLinksCount: 0,
      deletedNotificationsCount: 0,
      deletedLinkRequestsCount: 0,
      updatedUsersCount: 0,
    };
  }

  const userIds = unverifiedUsers.map((u) => {
    const id = u._id as mongoose.Types.ObjectId | string;
    return typeof id === 'string' ? id : id.toString();
  });

  const linkIdsToDelete = await Link.find({ userId: { $in: userIds } })
    .select("_id")
    .lean();
  const linkIds = linkIdsToDelete.map((l) => {
    const id = l._id as mongoose.Types.ObjectId | string;
    return typeof id === 'string' ? id : id.toString();
  });

  const [deletedLinksResult, deletedNotificationsResult, deletedLinkRequestsResult] =
    await Promise.all([
      deleteUserLinks(userIds),
      deleteUserNotifications(userIds),
      deleteUserLinkRequests(userIds),
    ]);

  const updatedUsersCount = await cleanupUserReferences(userIds, linkIds);

  const deletedUsersResult = await User.deleteMany({
    _id: { $in: userIds },
  });

  return {
    deletedCount: deletedUsersResult.deletedCount,
    deletedLinksCount: deletedLinksResult.deletedCount,
    deletedNotificationsCount: deletedNotificationsResult.deletedCount,
    deletedLinkRequestsCount: deletedLinkRequestsResult.deletedCount,
    updatedUsersCount,
  };
}

async function deleteUserLinks(userIds: string[]): Promise<{ deletedCount: number }> {
  const result = await Link.deleteMany({
    userId: { $in: userIds },
  });
  return { deletedCount: result.deletedCount };
}

async function deleteUserNotifications(userIds: string[]): Promise<{ deletedCount: number }> {
  const result = await Notification.deleteMany({
    $or: [{ userId: { $in: userIds } }, { actorId: { $in: userIds } }],
  });
  return { deletedCount: result.deletedCount };
}

async function deleteUserLinkRequests(userIds: string[]): Promise<{ deletedCount: number }> {
  const LinkRequest = mongoose.connection.models.LinkRequest ||
    mongoose.model(
      "LinkRequest",
      new mongoose.Schema(
        {
          requesterId: { type: String, required: true },
          receiverId: { type: String, required: true },
          status: {
            type: String,
            enum: ["requested", "accepted", "rejected"],
            default: "requested",
          },
          seen: { type: Boolean, default: false },
        },
        { timestamps: true }
      )
    );

  const result = await LinkRequest.deleteMany({
    $or: [
      { requesterId: { $in: userIds } },
      { receiverId: { $in: userIds } },
    ],
  });
  return { deletedCount: result.deletedCount };
}

async function cleanupUserReferences(userIds: string[], linkIds: string[]): Promise<number> {
  let updatedCount = 0;

  for (let i = 0; i < userIds.length; i += BATCH_SIZE) {
    const batch = userIds.slice(i, i + BATCH_SIZE);

    const results = await Promise.all([
      User.updateMany(
        { linked_to: { $in: batch } },
        { $pull: { linked_to: { $in: batch } } }
      ),
      User.updateMany(
        { linked_by: { $in: batch } },
        { $pull: { linked_by: { $in: batch } } }
      ),
    ]);

    updatedCount += results.reduce((sum, r) => sum + r.modifiedCount, 0);
  }

  if (linkIds.length > 0) {
    for (let i = 0; i < linkIds.length; i += BATCH_SIZE) {
      const batch = linkIds.slice(i, i + BATCH_SIZE);
      const result = await User.updateMany(
        { savedLinks: { $in: batch } },
        { $pull: { savedLinks: { $in: batch } } }
      );
      updatedCount += result.modifiedCount;
    }
  }

  return updatedCount;
}

