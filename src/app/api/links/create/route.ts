import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { requireAuth } from "@/lib/auth";
import { Link } from "@/models/Link";
import { User } from "@/models/User";
import { dbConnect } from "@/lib/dbConnect";
import { emitFeedUpdateEvent } from "@/lib/socket-helpers";

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

    const user = await User.findById(userId);
    if (user) {
      if (!user.links) {
        user.links = [];
      }

      if (!user.links.includes(link._id.toString())) {
        user.links.push(link._id.toString());
        await user.save();
      }
    }

    await emitFeedUpdateEvent(link._id.toString(), userId);

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
