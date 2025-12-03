import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { requireAuth } from "@/lib/auth";
import { Link } from "@/models/Link";
import { User } from "@/models/User";
import { dbConnect } from "@/lib/dbConnect";
import { createNotification } from "@/utils/notifications";
import mongoose from "mongoose";

const SOCKET_SERVER_URL = process.env.NEXT_PUBLIC_SOCKET_SERVER_URL!

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

        const user = await User.findById(userId).select("username user_avatar").lean() as { username?: string; user_avatar?: string } | null;

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

        try {
          await fetch(`${SOCKET_SERVER_URL}/api/notifications/interaction-notify`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: link.userId,
              actorId: userIdStr,
              linkId: linkId,
              type: "like",
              deepLink: deepLink,
              actor: {
                _id: userIdStr,
                username: user.username || "Unknown",
                avatar: user.user_avatar || null,
              },
            }),
          }).catch(() => {

          });
        } catch (socketError) {

          console.error("Socket notification error (non-critical):", socketError);
        }
      }
    }

    await link.save();

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
