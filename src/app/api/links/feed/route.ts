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
    const payload = requireAuth(cookieStore);
    const currentUserId = payload.userId.toString();
    
    const links = await Link.find({ userId: { $ne: currentUserId } })
      .sort({ createdAt: -1 })
      .lean();

    if (links.length === 0) {
      return NextResponse.json({ links: [] }, { status: 200 });
    }

    const userIds = [...new Set(links.map((link) => link.userId))];

    const users = await User.find({ _id: { $in: userIds } })
      .select("username user_avatar name accountPrivacy linked_to linked_by")
      .lean();

    const userMap = new Map(
      (users as Array<{ _id: unknown; accountPrivacy?: string; linked_to?: string[]; linked_by?: string[] }>).map((u) => [String(u._id), u])
    );

    const filteredLinks = links.filter((link) => {
      const linkUserId = String(link.userId);
      const linkUser = userMap.get(linkUserId);
      
      if (!linkUser) return false;
      
      const isPrivate = (linkUser.accountPrivacy || "public") === "private";
      
      if (!isPrivate) return true;
      
      const linkedTo = linkUser.linked_to || [];
      const linkedBy = linkUser.linked_by || [];
      const isLinked = linkedTo.includes(currentUserId) && linkedBy.includes(currentUserId);
      
      return isLinked;
    });

    interface UserInfo {
      _id: unknown;
      username?: string;
      user_avatar?: string;
      name?: string;
    }

    const publicUserMap = new Map<string, UserInfo>(
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

    const linksWithUser: LinkWithUserInfo[] = filteredLinks.map((link) => {
      const linkObj = link as Record<string, unknown>;
      const userId = String(linkObj.userId || '');
      return {
        ...linkObj,
        userInfo: userId && publicUserMap.get(userId) ? {
          username: publicUserMap.get(userId)?.username,
          user_avatar: publicUserMap.get(userId)?.user_avatar,
          name: publicUserMap.get(userId)?.name,
        } : null,
      };
    });

    return NextResponse.json({ links: linksWithUser }, { status: 200 });
  } catch (error) {
    console.error("Error fetching feed links:", error);
    
    const errorMessage = error instanceof Error ? error.message : "Failed to fetch links";
    const isUnauthorized = errorMessage.includes("Unauthorized");
    
    return NextResponse.json(
      { error: errorMessage },
      { status: isUnauthorized ? 401 : 500 }
    );
  }
}
