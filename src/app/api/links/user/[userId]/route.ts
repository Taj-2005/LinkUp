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
    requireAuth(cookieStore);
    const { userId } = await params;

    const links = await Link.find({ userId })
      .sort({ createdAt: -1 })
      .lean();

    const user = await User.findById(userId).select("username user_avatar name").lean();

    interface UserInfo {
      username?: string;
      user_avatar?: string;
      name?: string;
    }

    const linksWithUser = links.map((link) => ({
      ...link,
      userInfo: user && !Array.isArray(user) ? {
        username: (user as UserInfo).username,
        user_avatar: (user as UserInfo).user_avatar,
        name: (user as UserInfo).name,
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
