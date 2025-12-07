import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { requireAuth } from "@/lib/auth";
import { Link, IComment } from "@/models/Link";
import { User } from "@/models/User";
import { dbConnect } from "@/lib/dbConnect";
import { createNotification } from "@/utils/notifications";
import { emitNotificationEvent, emitLinkUpdateEvent } from "@/lib/socket-helpers";
import mongoose from "mongoose";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ linkId: string }> }
) {
  await dbConnect();

  const cookieStore = await cookies();

  try {
    const payload = requireAuth(cookieStore);
    const userId = payload.userId;
    const { linkId } = await params;

    if (!mongoose.Types.ObjectId.isValid(linkId)) {
      return NextResponse.json({ error: "Invalid link ID" }, { status: 400 });
    }

    const link = await Link.findById(linkId);

    if (!link) {
      return NextResponse.json({ error: "Link not found" }, { status: 404 });
    }

    const userIdStr = userId.toString();
    const isLiked = link.likes.includes(userIdStr);

    if (isLiked) {

      link.likes = link.likes.filter((id: string) => id !== userIdStr);
    } else {

      if (!link.likes.includes(userIdStr)) {
        link.likes.push(userIdStr);
        
        const user = await User.findById(userId).select("username name user_avatar").lean() as { username?: string; name?: string; user_avatar?: string } | null;

        if (!user) {
          return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const { generateDeepLink } = await import("@/utils/deepLinks");
        const deepLink = generateDeepLink(linkId, "like");

        await createNotification({
          userId: link.userId,
          actorId: userIdStr,
          linkId: linkId,
          type: "like",
        });

        await emitNotificationEvent({
          userId: link.userId,
          actorId: userIdStr,
          linkId: linkId,
          type: "like",
          deepLink: deepLink,
          actor: {
            _id: userIdStr,
            username: user.username || "Unknown",
            name: user.name || undefined,
            avatar: user.user_avatar || null,
          },
        });
      }
    }

    await link.save();

    await emitLinkUpdateEvent({
      _id: link._id.toString(),
      userId: link.userId.toString(),
      likes: link.likes,
      comments: link.comments.map((c: IComment) => ({
        _id: c._id.toString(),
        userId: c.userId,
        username: c.username,
        user_avatar: c.user_avatar,
        text: c.text,
        replies: c.replies || [],
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      })),
    });

    return NextResponse.json(
      {
        success: true,
        isLiked: !isLiked,
        likesCount: link.likes.length,
        link: {
          _id: link._id.toString(),
          likes: link.likes,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error toggling like:", error);
    return NextResponse.json(
      { error: "Failed to toggle like" },
      { status: 500 }
    );
  }
}
