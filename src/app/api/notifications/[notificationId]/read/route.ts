import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { requireAuth } from "@/lib/auth";
import { dbConnect } from "@/lib/dbConnect";
import { Notification } from "@/models/Notification";
import { emitNotificationUpdateEvent } from "@/lib/socket-helpers";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ notificationId: string }> }
) {
  await dbConnect();

  const cookieStore = await cookies();

  try {
    const payload = requireAuth(cookieStore);
    const userId = payload.userId;
    const { notificationId } = await params;

    const notification = await Notification.findOne({
      _id: notificationId,
      userId,
    });

    if (!notification) {
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404 }
      );
    }

    notification.read = true;
    await notification.save();

    await emitNotificationUpdateEvent({
      userId,
      action: "seen",
      notificationId: notificationId,
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return NextResponse.json(
      { error: "Failed to mark notification as read" },
      { status: 500 }
    );
  }
}
