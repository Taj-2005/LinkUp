import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { requireAuth } from "@/lib/auth";
import { Link, IComment, IReply } from "@/models/Link";
import { User } from "@/models/User";
import { dbConnect } from "@/lib/dbConnect";
import { emitLinkCreatedEvent } from "@/lib/socket-helpers";

export async function POST(req: Request) {
  await dbConnect();

  const cookieStore = await cookies();

  try {
    const payload = requireAuth(cookieStore);
    const userId = payload.userId;

    const body = await req.json();
    const { imageUrl, description, location } = body;

    if (!imageUrl || typeof imageUrl !== "string") {
      return NextResponse.json(
        { error: "Image URL is required" },
        { status: 400 }
      );
    }

    if (description && description.length > 2200) {
      return NextResponse.json(
        { error: "Description must be 2200 characters or less" },
        { status: 400 }
      );
    }

    if (location && location.length > 100) {
      return NextResponse.json(
        { error: "Location must be 100 characters or less" },
        { status: 400 }
      );
    }

    const link = new Link({
      userId,
      imageUrl,
      description: description?.trim() || "",
      location: location?.trim() || "",
      likes: [],
      comments: [],
    });

    await link.save();

    const user = await User.findById(userId).select("username name user_avatar links");
    if (user) {
      if (!user.links) {
        user.links = [];
      } 

      if (!user.links.includes(link._id.toString())) {
        user.links.push(link._id.toString());
        await user.save();
      }
    }

    const linkData = {
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
    };
      
    await emitLinkCreatedEvent({
      link: {
        ...linkData,
        userInfo: {
          username: user?.username || "Unknown",
          user_avatar: user?.user_avatar,
          name: user?.name,
        },
      },
      actor: {
        _id: user?._id.toString() || userId.toString(),
        username: user?.username || "Unknown",
        name: user?.name,
        user_avatar: user?.user_avatar,
      },
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(
      {
        success: true,
        link: {
          _id: link._id,
          userId: link.userId,
          imageUrl: link.imageUrl,
          description: link.description,
          location: link.location,
          likes: link.likes,
          comments: link.comments,
          createdAt: link.createdAt,
          updatedAt: link.updatedAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating link:", error);
    return NextResponse.json(
      { error: "Failed to create link" },
      { status: 500 }
    );
  }
}
