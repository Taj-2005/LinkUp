import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { requireAuth } from "@/lib/auth";
import { dbConnect } from "@/lib/dbConnect";
import { Notification } from "@/models/Notification";

export async function GET() {
  await dbConnect();

  const cookieStore = await cookies();

  try {
    const payload = requireAuth(cookieStore);
    const userId = payload.userId;

    const unreadCount = await Notification.countDocuments({
      userId,
      read: false,
    });

    return NextResponse.json({ count: unreadCount }, { status: 200 });
  } catch (error) {
    console.error("Error fetching unread notification count:", error);
    return NextResponse.json(
      { error: "Failed to fetch unread notification count" },
      { status: 500 }
    );
  }
}
