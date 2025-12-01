import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { requireAuth } from "@/lib/auth";
import { Link, IReply } from "@/models/Link";
import { User } from "@/models/User";
import { dbConnect } from "@/lib/dbConnect";
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

    // Get user info for the reply
    const user = await User.findById(userId).select("username user_avatar");
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const link = await Link.findById(linkId);
    if (!link) {
      return NextResponse.json({ error: "Link not found" }, { status: 404 });
    }

    // Find the comment
    const comment = link.comments.id(commentId);
    if (!comment) {
      return NextResponse.json(
        { error: "Comment not found" },
        { status: 404 }
      );
    }

    // Add reply to the comment
    const newReply: Partial<IReply> = {
      userId: userId.toString(),
      username: user.username || "Unknown",
      user_avatar: user.user_avatar || "",
      text: text.trim(),
    };

    comment.replies.push(newReply as IReply);
    await link.save();

    // Get the newly created reply (last one in array)
    const savedReply = comment.replies[comment.replies.length - 1];

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

