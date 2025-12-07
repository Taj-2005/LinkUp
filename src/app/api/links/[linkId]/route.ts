import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { requireAuth } from "@/lib/auth";
import { Link } from "@/models/Link";
import { User } from "@/models/User";
import { dbConnect } from "@/lib/dbConnect";
import { emitLinkDeletedEvent } from "@/lib/socket-helpers";
import mongoose from "mongoose";

export async function DELETE(
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

    // Verify ownership
    if (link.userId.toString() !== userId.toString()) {
      return NextResponse.json(
        { error: "Forbidden: You can only delete your own posts" },
        { status: 403 }
      );
    }

    const linkIdStr = linkId.toString();
    const ownerId = link.userId.toString();

    // Use MongoDB session for atomic transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Delete the link document
      await Link.findByIdAndDelete(linkId).session(session);

      // Atomically remove linkId from user.links array
      const db = mongoose.connection.db;
      if (!db) {
        await session.abortTransaction();
        return NextResponse.json(
          { error: "Database connection not available" },
          { status: 500 }
        );
      }

      const usersCollection = db.collection('users');
      const userIdObjectId = new mongoose.Types.ObjectId(ownerId);

      await usersCollection.updateOne(
        { _id: userIdObjectId },
        { $pull: { links: linkIdStr } } as unknown as mongoose.mongo.UpdateFilter<mongoose.mongo.Document>,
        { session }
      );

      // Commit transaction
      await session.commitTransaction();

      // Get updated user info for socket event
      const updatedUser = await User.findById(ownerId)
        .select("_id links")
        .lean();

      // Define type for lean user result
      interface UserWithLinks {
        _id: unknown;
        links?: unknown[];
        [key: string]: unknown;
      }

      // Handle the case where findById might return an array (TypeScript safety)
      const userData = updatedUser && !Array.isArray(updatedUser) 
        ? (updatedUser as UserWithLinks)
        : null;

      // Emit socket event for real-time update (non-blocking)
      await emitLinkDeletedEvent({
        linkId: linkIdStr,
        ownerId: ownerId,
        updatedOwner: userData ? {
          _id: String(userData._id),
          links: (userData.links || []).map((id: unknown) => String(id)),
        } : undefined,
        timestamp: new Date().toISOString(),
      });

      return NextResponse.json(
        {
          success: true,
          deletedId: linkIdStr,
          updatedUser: userData ? {
            _id: String(userData._id),
            linksCount: (userData.links || []).length,
            links: (userData.links || []).map((id: unknown) => String(id)),
          } : undefined,
        },
        { status: 200 }
      );
    } catch (error) {
      // Rollback transaction on error
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  } catch (error) {
    console.error("Error deleting link:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete link" },
      { status: 500 }
    );
  }
}

