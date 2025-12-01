import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { requireAuth } from "@/lib/auth";
import { User } from "@/models/User";
import { Link } from "@/models/Link";
import { dbConnect } from "@/lib/dbConnect";
import mongoose from "mongoose";

export async function GET(
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

    // Get user's savedLinks from database (definitive source)
    const user = await User.findById(userId).select("savedLinks").lean();
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const linkIdStr = linkId.toString();
    
    // Type guard for user with savedLinks property
    interface UserWithSavedLinks {
      savedLinks?: unknown[];
      [key: string]: unknown;
    }
    
    const userWithSavedLinks = user as UserWithSavedLinks;
    
    // Ensure savedLinks is an array (handle case where field doesn't exist in DB for old users)
    const savedLinks = Array.isArray(userWithSavedLinks.savedLinks) ? userWithSavedLinks.savedLinks : [];
    
    // Convert all savedLinks to strings for consistent comparison
    const savedLinksStr = savedLinks.map((id: unknown) => String(id));
    const isSaved = savedLinksStr.includes(linkIdStr);

    return NextResponse.json(
      {
        saved: isSaved,
        linkId: linkIdStr,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error checking saved status:", error);
    return NextResponse.json(
      { error: "Failed to check saved status" },
      { status: 500 }
    );
  }
}

