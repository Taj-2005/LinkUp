import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { requireAuth } from "@/lib/auth";
import { User } from "@/models/User";
import { dbConnect } from "@/lib/dbConnect";

export async function GET() {
  await dbConnect();

  const cookieStore = await cookies();

  try {
    const payload = requireAuth(cookieStore);

    const user = await User.findById(payload.userId).select("_id name username user_avatar bio sex location email createdAt linked_by linked_to links savedLinks accountPrivacy");

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userObj = user.toObject();
    if (!Array.isArray(userObj.savedLinks)) {
      userObj.savedLinks = [];
    }

    return NextResponse.json({ user: userObj }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
