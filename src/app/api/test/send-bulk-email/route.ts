import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { requireAuth } from "@/lib/auth";
import { dbConnect } from "@/lib/dbConnect";
import { User } from "@/models/User";
import { sendEngagementEmail } from "@/lib/email";

export async function POST() {
  try {
    await dbConnect();

    const cookieStore = await cookies();

    const authResult = requireAuth(cookieStore);

    if (authResult.username?.toLowerCase() !== "tajuddinshaik_6") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const verifiedUsers = await User.find({ isVerified: true })
      .select("email username name")
      .lean();

    if (verifiedUsers.length === 0) {
      return NextResponse.json({
        total: 0,
        sent: 0,
        failed: 0,
        message: "No verified users found",
      });
    }

    let sent = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const user of verifiedUsers) {
      try {
        await sendEngagementEmail(
          user.email,
          user.username || user.name || "there"
        );
        sent++;
      } catch (error) {
        failed++;
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        errors.push(`${user.email}: ${errorMessage}`);
        console.error(`[BULK-EMAIL] Failed to send to ${user.email}:`, errorMessage);
      }
    }

    return NextResponse.json({
      total: verifiedUsers.length,
      sent,
      failed,
      errors: errors.length > 0 ? errors.slice(0, 10) : undefined,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("[BULK-EMAIL] Error:", errorMessage);
    return NextResponse.json(
      { error: "Server error", details: errorMessage },
      { status: 500 }
    );
  }
}

