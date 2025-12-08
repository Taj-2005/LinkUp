import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { requireAuth } from "@/lib/auth";
import { Link, IComment, IReply } from "@/models/Link";
import { User } from "@/models/User";
import { dbConnect } from "@/lib/dbConnect";
import { createNotification } from "@/utils/notifications";
import { emitNotificationEvent, emitLinkUpdateEvent } from "@/lib/socket-helpers";
import mongoose from "mongoose";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ linkId: string; commentId: string }> }
) {
  await dbConnect();

  const cookieStore = await cookies();

  try {
    const payload = requireAuth(cookieStore);
    const userId = payload.userId;
    const { linkId, commentId } = await params;

    const body = await req.json();
    const { text } = body;

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return NextResponse.json(
        { error: "Reply text is required" },
        { status: 400 }
      );
    }

    if (text.trim().length > 500) {
      return NextResponse.json(
        { error: "Reply must be 500 characters or less" },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(linkId)) {
      return NextResponse.json({ error: "Invalid link ID" }, { status: 400 });
    }

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
      return NextResponse.json(
        { error: "Invalid comment ID" },
        { status: 400 }
      );
    }

    const user = await User.findById(userId).select("username name user_avatar");
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const link = await Link.findById(linkId);
    if (!link) {
      return NextResponse.json({ error: "Link not found" }, { status: 404 });
    }

    const comment = link.comments.id(commentId);
    if (!comment) {
      return NextResponse.json(
        { error: "Comment not found" },
        { status: 404 }
      );
    }

    const newReply: Partial<IReply> = {
      userId: userId.toString(),
      username: user.username || "Unknown",
      user_avatar: user.user_avatar || "",
      text: text.trim(),
    };

    comment.replies.push(newReply as IReply);
    await link.save();

    const savedReply = comment.replies[comment.replies.length - 1];

    if (link.userId.toString() !== userId.toString()) {
      const { generateDeepLink } = await import("@/utils/deepLinks");
      const deepLink = generateDeepLink(linkId, "reply", commentId, savedReply._id.toString());

      await createNotification({
        userId: link.userId,
        actorId: userId.toString(),
        linkId: linkId,
        type: "reply",
        commentId: commentId,
        replyId: savedReply._id.toString(),
      });

      await emitNotificationEvent({
        userId: link.userId,
        actorId: userId.toString(),
        linkId: linkId,
        type: "reply",
        commentId: commentId,
        replyId: savedReply._id.toString(),
        deepLink: deepLink,
        commentText: text.trim(),
        actor: {
          _id: user._id.toString(),
          username: user.username || "Unknown",
          name: user.name || undefined,
          avatar: user.user_avatar || null,
        },
      });
    }

    await emitLinkUpdateEvent({
      _id: link._id.toString(),
      userId: link.userId.toString(),
      imageUrl: link.imageUrl,
      description: link.description,
      location: link.location,
      likes: link.likes,
      comments: link.comments.map((c: IComment) => ({
        _id: c._id.toString(),
        userId: c.userId,
        username: c.username,
        user_avatar: c.user_avatar,
        text: c.text,
        replies: c.replies.map((r: IReply) => ({
          _id: r._id.toString(),
          userId: r.userId,
          username: r.username,
          user_avatar: r.user_avatar,
          text: r.text,
          createdAt: r.createdAt,
          updatedAt: r.updatedAt,
        })),
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      })),
      createdAt: link.createdAt,
      updatedAt: link.updatedAt,
    });

    return NextResponse.json(
      {
        success: true,
        reply: {
          _id: savedReply._id.toString(),
          userId: savedReply.userId,
          username: savedReply.username,
          user_avatar: savedReply.user_avatar,
          text: savedReply.text,
          createdAt: savedReply.createdAt,
          updatedAt: savedReply.updatedAt,
        },
        link: {
          _id: link._id.toString(),
          comments: link.comments.map((c: IComment) => ({
            _id: c._id.toString(),
            userId: c.userId,
            username: c.username,
            user_avatar: c.user_avatar,
            text: c.text,
            replies: c.replies.map((r: IReply) => ({
              _id: r._id.toString(),
              userId: r.userId,
              username: r.username,
              user_avatar: r.user_avatar,
              text: r.text,
              createdAt: r.createdAt,
              updatedAt: r.updatedAt,
            })),
            createdAt: c.createdAt,
            updatedAt: c.updatedAt,
          })),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding reply:", error);
    return NextResponse.json(
      { error: "Failed to add reply" },
      { status: 500 }
    );
  }
}
