import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { requireAuth } from "@/lib/auth";
import { Link } from "@/models/Link";
import { User } from "@/models/User";
import { dbConnect } from "@/lib/dbConnect";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  await dbConnect();

  const cookieStore = await cookies();

  try {
    const payload = requireAuth(cookieStore);
    const currentUserId = payload.userId.toString();
    const { userId } = await params;

    const profileUser = await User.findById(userId).select("username user_avatar name accountPrivacy linked_to linked_by").lean();
    
    if (!profileUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const profileUserTyped = profileUser as { accountPrivacy?: string; linked_to?: string[]; linked_by?: string[] };
    const isPrivateAccount = (profileUserTyped.accountPrivacy || "public") === "private";
    const isOwnProfile = currentUserId === userId;
    
    if (isPrivateAccount && !isOwnProfile) {
      const linkedTo = profileUserTyped.linked_to || [];
      const linkedBy = profileUserTyped.linked_by || [];
      const isLinked = linkedTo.includes(currentUserId) && linkedBy.includes(currentUserId);
      
      if (!isLinked) {
        return NextResponse.json(
          { links: [], isPrivate: true },
          { status: 200 }
        );
      }
    }

    const links = await Link.find({ userId })
      .sort({ createdAt: -1 })
      .lean();

    interface UserInfo {
      username?: string;
      user_avatar?: string;
      name?: string;
    }

    const user = profileUser as UserInfo;

    const linksWithUser = links.map((link) => ({
      ...link,
      userInfo: user ? {
        username: user.username,
        user_avatar: user.user_avatar,
        name: user.name,
      } : null,
    }));

    return NextResponse.json({ links: linksWithUser }, { status: 200 });
  } catch (error) {
    console.error("Error fetching user links:", error);
    return NextResponse.json(
      { error: "Failed to fetch links" },
      { status: 500 }
    );
  }
}
