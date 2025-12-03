import { dbConnect } from "@/lib/dbConnect";
import { Notification, NotificationType } from "@/models/Notification";
import { generateDeepLink } from "./deepLinks";

interface CreateNotificationParams {
  userId: string;
  actorId: string;
  linkId: string;
  type: NotificationType;
  commentId?: string;
  replyId?: string;
}

export async function createNotification({
  userId,
  actorId,
  linkId,
  type,
  commentId,
  replyId,
}: CreateNotificationParams): Promise<void> {
  await dbConnect();

  if (userId === actorId) {
    return;
  }

  const existing = await Notification.findOne({
    userId,
    actorId,
    linkId,
    type,
    ...(commentId && { commentId }),
    ...(replyId && { replyId }),
  });

  if (existing) {

    const deepLink = generateDeepLink(linkId, type, commentId, replyId);
    existing.read = false;
    existing.createdAt = new Date();
    existing.deepLink = deepLink;
    await existing.save();
    return;
  }

  const deepLink = generateDeepLink(linkId, type, commentId, replyId);

  await Notification.create({
    userId,
    actorId,
    linkId,
    type,
    ...(commentId && { commentId }),
    ...(replyId && { replyId }),
    deepLink,
    read: false,
  });
}
