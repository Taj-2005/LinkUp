import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { requireAuth } from "@/lib/auth";
import { Link } from "@/models/Link";
import { User } from "@/models/User";
import { dbConnect } from "@/lib/dbConnect";

export async function GET() {
  await dbConnect();

  const cookieStore = await cookies();

  try {
    requireAuth(cookieStore);

    // Get all links from all users, sorted by newest first
    const links = await Link.find()
      .sort({ createdAt: -1 })
      .lean();

    if (links.length === 0) {
      return NextResponse.json({ links: [] }, { status: 200 });
    }

    // Get unique user IDs
    const userIds = [...new Set(links.map((link) => link.userId))];
    
    // Get user info for all users
    const users = await User.find({ _id: { $in: userIds } })
      .select("username user_avatar name")
      .lean();

    // Create a map for quick lookup
    interface UserInfo {
      _id: unknown;
      username?: string;
      user_avatar?: string;
      name?: string;
    }

    const userMap = new Map<string, UserInfo>(
      (users as UserInfo[]).map((u) => [String(u._id), u])
    );

    // Add user info to each link
    interface LinkWithUserInfo {
      [key: string]: unknown;
      userInfo: {
        username?: string;
        user_avatar?: string;
        name?: string;
      } | null;
    }

    const linksWithUser: LinkWithUserInfo[] = links.map((link) => {
      const linkObj = link as Record<string, unknown>;
      const userId = String(linkObj.userId || '');
      return {
        ...linkObj,
        userInfo: userId && userMap.get(userId) ? {
          username: userMap.get(userId)?.username,
          user_avatar: userMap.get(userId)?.user_avatar,
          name: userMap.get(userId)?.name,
        } : null,
      };
    });

    return NextResponse.json({ links: linksWithUser }, { status: 200 });
  } catch (error) {
    console.error("Error fetching feed links:", error);
    return NextResponse.json(
      { error: "Failed to fetch links" },
      { status: 500 }
    );
  }
}

