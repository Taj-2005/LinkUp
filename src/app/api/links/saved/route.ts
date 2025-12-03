import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { requireAuth } from "@/lib/auth";
import { User } from "@/models/User";
import { Link } from "@/models/Link";
import { dbConnect } from "@/lib/dbConnect";

export async function GET() {
  await dbConnect();

  const cookieStore = await cookies();

  try {
    const payload = requireAuth(cookieStore);
    const userId = payload.userId;

    const user = await User.findById(userId).select("savedLinks").lean();
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    interface UserWithSavedLinks {
      savedLinks?: unknown[];
      [key: string]: unknown;
    }

    const userWithSavedLinks = user as UserWithSavedLinks;

    const savedLinkIds = Array.isArray(userWithSavedLinks.savedLinks) ? userWithSavedLinks.savedLinks : [];

    if (savedLinkIds.length === 0) {
      return NextResponse.json({ links: [] }, { status: 200 });
    }

    const links = await Link.find({ _id: { $in: savedLinkIds } })
      .sort({ createdAt: -1 })
      .lean();

    const userIds = [...new Set(links.map((link) => link.userId))];
    const users = await User.find({ _id: { $in: userIds } })
      .select("username user_avatar name")
      .lean();

    interface UserInfo {
      _id: unknown;
      username?: string;
      user_avatar?: string;
      name?: string;
    }

    const userMap = new Map<string, UserInfo>(
      (users as UserInfo[]).map((u) => [String(u._id), u])
    );

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
    console.error("Error fetching saved links:", error);
    return NextResponse.json(
      { error: "Failed to fetch saved links" },
      { status: 500 }
    );
  }
}
