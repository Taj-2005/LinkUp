import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { requireAuth } from "@/lib/auth";
import { Link, IComment, IReply } from "@/models/Link";
import { dbConnect } from "@/lib/dbConnect";
import { emitLinkUpdateEvent } from "@/lib/socket-helpers";
import mongoose from "mongoose";

export async function DELETE(
  req: Request, 
  { params }: { params: Promise<{ linkId: string; commentId: string; replyId: string }> }
) {
  await dbConnect();

  const cookieStore = await cookies();

  try {
    const payload = requireAuth(cookieStore);
    const userId = payload.userId;
    const { linkId, commentId, replyId } = await params;

    if (!mongoose.Types.ObjectId.isValid(linkId)) {
      return NextResponse.json({ error: "Invalid link ID" }, { status: 400 });
    }

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
      return NextResponse.json(
        { error: "Invalid comment ID" },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(replyId)) {
      return NextResponse.json(
        { error: "Invalid reply ID" },
        { status: 400 }
      );
    }

    const link = await Link.findById(linkId);
    if (!link) {
      return NextResponse.json({ error: "Link not found" }, { status: 404 });
    } 

    if (link.userId.toString() !== userId.toString()) {
      return NextResponse.json(
        { error: "Forbidden: Only the link owner can delete replies" },
        { status: 403 }
      );
    }

    const comment = link.comments.id(commentId);
    if (!comment) {
      return NextResponse.json(
        { error: "Comment not found" },
        { status: 404 }
      );
    }

    const reply = comment.replies.id(replyId);
    if (!reply) {
      return NextResponse.json(
        { error: "Reply not found" },
        { status: 404 }
      );
    }

    comment.replies.pull(replyId);
    await link.save();

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
        replies: (c.replies || []).map((r: IReply) => ({
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
        deletedId: replyId,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting reply:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete reply" },
      { status: 500 }
    );
  }
}

