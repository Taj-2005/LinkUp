import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { requireAuth } from "@/lib/auth";
import { User } from "@/models/User";
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

    // Verify link exists
    const link = await Link.findById(linkId);
    if (!link) {
      return NextResponse.json({ error: "Link not found" }, { status: 404 });
    }

    // First check current state using lean query
    const currentUser = await User.findById(userId).lean();
    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const linkIdStr = linkId.toString();
    
    // Type guard for user with savedLinks property
    interface UserWithSavedLinks {
      savedLinks?: unknown[];
      [key: string]: unknown;
    }
    
    const userWithSavedLinks = currentUser as UserWithSavedLinks;
    
    // Get current savedLinks array (handle case where field doesn't exist)
    const currentSavedLinks = Array.isArray(userWithSavedLinks.savedLinks) ? userWithSavedLinks.savedLinks : [];
    const savedLinksStr = currentSavedLinks.map((id: unknown) => String(id));
    const wasSaved = savedLinksStr.includes(linkIdStr);

    // Use native MongoDB collection to bypass Mongoose schema issues
    const db = mongoose.connection.db;
    if (!db) {
      return NextResponse.json(
        { error: "Database connection not available" },
        { status: 500 }
      );
    }
    const usersCollection = db.collection('users');
    const userIdObjectId = new mongoose.Types.ObjectId(userId);

    // Use MongoDB array operators for reliable updates - these work even if field doesn't exist
    let updateResult;
    if (wasSaved) {
      // Unsave: remove linkId from savedLinks array using $pull
      updateResult = await usersCollection.updateOne(
        { _id: userIdObjectId },
        { $pull: { savedLinks: linkIdStr } } as unknown as mongoose.mongo.UpdateFilter<mongoose.mongo.Document>
      );
    } else {
      // Save: add linkId to savedLinks array using $addToSet (prevents duplicates)
      // If field doesn't exist, MongoDB will create it automatically
      updateResult = await usersCollection.updateOne(
        { _id: userIdObjectId },
        { $addToSet: { savedLinks: linkIdStr } } as unknown as mongoose.mongo.UpdateFilter<mongoose.mongo.Document>
      );
    }

    if (updateResult.matchedCount === 0) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    if (updateResult.modifiedCount === 0 && !wasSaved) {
      // If we tried to save but nothing was modified, the link might already be there
      console.warn('Update reported 0 modifications but we expected to save');
    }
    
    // Wait a tiny bit to ensure write is committed, then verify
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Get the updated user using native collection to verify
    const updatedUserDoc = await usersCollection.findOne(
      { _id: userIdObjectId },
      { projection: { savedLinks: 1 } }
    );
    
    // Convert to format expected by rest of code
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

    // Log for debugging
    console.log('Save operation:', {
      userId: userId.toString(),
      linkId: linkIdStr,
      wasSaved,
      action: wasSaved ? 'unsaved' : 'saved',
      updateResult: {
        matchedCount: updateResult.matchedCount,
        modifiedCount: updateResult.modifiedCount
      },
      currentSavedLinksBefore: currentSavedLinks.length,
      updatedUserSavedLinks: updatedUser.savedLinks?.length || 0,
      updatedUserSavedLinksArray: updatedUser.savedLinks
    });

    // Verify the save was successful by querying DB again using native collection (definitive check)
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

    // Ensure we have an array (handle case where field doesn't exist in DB)
    const verifySavedLinks = Array.isArray(verifyUserDoc.savedLinks) 
      ? verifyUserDoc.savedLinks.map((id: unknown) => String(id))
      : [];
    const isNowSaved = verifySavedLinks.includes(linkIdStr);
    
    // Log verification for debugging
    console.log('Verification:', {
      userId: userId.toString(),
      linkId: linkIdStr,
      verifySavedLinksCount: verifySavedLinks.length,
      isNowSaved,
      verifySavedLinks: verifySavedLinks,
      verifyUserRaw: verifyUserDoc.savedLinks,
      expectedSaved: !wasSaved,
      updateResult: {
        matchedCount: updateResult.matchedCount,
        modifiedCount: updateResult.modifiedCount
      }
    });
    
    // Double-check: if verification doesn't match expected state, log error
    if (wasSaved && isNowSaved) {
      console.error('ERROR: Link should be unsaved but verification shows it as saved!');
    } else if (!wasSaved && !isNowSaved) {
      console.error('ERROR: Link should be saved but verification shows it as unsaved!');
      console.error('Debug info:', {
        wasSaved,
        isNowSaved,
        verifySavedLinks,
        currentSavedLinksBefore: currentSavedLinks,
        updatedUserSavedLinks: updatedUser?.savedLinks,
        verifyUserSavedLinks: verifyUserDoc.savedLinks,
        updateResult: {
          matchedCount: updateResult.matchedCount,
          modifiedCount: updateResult.modifiedCount
        },
        verifyUserDocRaw: verifyUserDoc
      });
    }

    // Return the new state and the action that was performed
    return NextResponse.json(
      {
        success: true,
        saved: isNowSaved,
        isSaved: isNowSaved, // Keep both for backward compatibility
        action: wasSaved ? 'unsaved' : 'saved', // Track the action performed
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

