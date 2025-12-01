import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { requireAuth } from "@/lib/auth";
import { Link } from "@/models/Link";
import { dbConnect } from "@/lib/dbConnect";
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
      // Unlike: remove userId from likes array
      link.likes = link.likes.filter((id: string) => id !== userIdStr);
    } else {
      // Like: add userId to likes array
      if (!link.likes.includes(userIdStr)) {
        link.likes.push(userIdStr);
      }
    }

    await link.save();

    return NextResponse.json(
      {
        success: true,
        isLiked: !isLiked,
        likesCount: link.likes.length,
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

