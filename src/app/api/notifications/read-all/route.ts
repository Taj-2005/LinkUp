import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { requireAuth } from "@/lib/auth";
import { dbConnect } from "@/lib/dbConnect";
import { Notification } from "@/models/Notification";
import { emitNotificationUpdateEvent } from "@/lib/socket-helpers";

export async function PATCH() {
  await dbConnect();

  const cookieStore = await cookies();

  try {
    const payload = requireAuth(cookieStore);
    const userId = payload.userId;

    await Notification.updateMany(
      { userId, read: false },
      { $set: { read: true } }
    );

    await emitNotificationUpdateEvent({
      userId,
      action: "clear",
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    return NextResponse.json(
      { error: "Failed to mark all notifications as read" },
      { status: 500 }
    );
  }
}
