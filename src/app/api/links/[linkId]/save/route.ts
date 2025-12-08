import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { requireAuth } from "@/lib/auth";
import { User } from "@/models/User";
import { Link } from "@/models/Link";
import { dbConnect } from "@/lib/dbConnect";
import { createNotification } from "@/utils/notifications";
import { emitNotificationEvent } from "@/lib/socket-helpers";
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

    const currentUser = await User.findById(userId).lean();
    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const linkIdStr = linkId.toString();
    
    interface UserWithSavedLinks {
      savedLinks?: unknown[];
      [key: string]: unknown;
    }
    
    const userWithSavedLinks = currentUser as UserWithSavedLinks;
    
    const currentSavedLinks = Array.isArray(userWithSavedLinks.savedLinks) ? userWithSavedLinks.savedLinks : [];
    const savedLinksStr = currentSavedLinks.map((id: unknown) => String(id));
    const wasSaved = savedLinksStr.includes(linkIdStr);

    const db = mongoose.connection.db;
    if (!db) {
      return NextResponse.json(
        { error: "Database connection not available" },
        { status: 500 }
      );
    }
    const usersCollection = db.collection('users');
    const userIdObjectId = new mongoose.Types.ObjectId(userId);

    let updateResult;
    if (wasSaved) {

      updateResult = await usersCollection.updateOne(
        { _id: userIdObjectId },
        { $pull: { savedLinks: linkIdStr } } as unknown as mongoose.mongo.UpdateFilter<mongoose.mongo.Document>
      );
    } else {

      updateResult = await usersCollection.updateOne(
        { _id: userIdObjectId },
        { $addToSet: { savedLinks: linkIdStr } } as unknown as mongoose.mongo.UpdateFilter<mongoose.mongo.Document>
      );

      let actorUser: { username?: string; name?: string; user_avatar?: string } | null = currentUser as { username?: string; name?: string; user_avatar?: string } | null;
      if (!actorUser) {
        const fetchedUser = await User.findById(userId).select("username name user_avatar").lean() as { username?: string; name?: string; user_avatar?: string } | null;
        actorUser = fetchedUser;
      }
      
      if (link.userId.toString() !== userId.toString()) {
        const { generateDeepLink } = await import("@/utils/deepLinks");
        const deepLink = generateDeepLink(linkId, "save");

        await createNotification({
          userId: link.userId,
          actorId: userId.toString(),
          linkId: linkId,
          type: "save",
        });

        await emitNotificationEvent({
          userId: link.userId,
          actorId: userId.toString(),
          linkId: linkId,
          type: "save",
          deepLink: deepLink,
          actor: {
            _id: userId.toString(),
            username: actorUser?.username || "Unknown",
            name: actorUser?.name || undefined,
            avatar: actorUser?.user_avatar || null,
          },
        });
      }
    }

    if (updateResult.matchedCount === 0) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }
    
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const updatedUserDoc = await usersCollection.findOne(
      { _id: userIdObjectId },
      { projection: { savedLinks: 1 } }
    );
    
    const updatedUser = updatedUserDoc ? {
      _id: updatedUserDoc._id.toString(),
      savedLinks: updatedUserDoc.savedLinks || []
    } : null;
    
    if (!updatedUser) {
      return NextResponse.json(
        { error: "Failed to retrieve updated user" },
        { status: 500 }
      );
    }

    const verifyUserDoc = await usersCollection.findOne(
      { _id: userIdObjectId },
      { projection: { savedLinks: 1 } }
    );
    
    if (!verifyUserDoc) {
      return NextResponse.json(
        { error: "Failed to verify save" },
        { status: 500 }
      );
    }

    const verifySavedLinks = Array.isArray(verifyUserDoc.savedLinks) 
      ? verifyUserDoc.savedLinks.map((id: unknown) => String(id))
      : [];
    const isNowSaved = verifySavedLinks.includes(linkIdStr);
    
    return NextResponse.json(
      {
        success: true,
        saved: isNowSaved,
        isSaved: isNowSaved,
        action: wasSaved ? 'unsaved' : 'saved',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error toggling save:", error);
    return NextResponse.json(
      { error: "Failed to toggle save" },
      { status: 500 }
    );
  }
}
