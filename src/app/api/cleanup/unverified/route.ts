import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { cleanupUnverifiedUsers } from "@/lib/services/userCleanup";

const CLEANUP_SECRET = process.env.CLEANUP_SECRET;

if (!CLEANUP_SECRET) {
  throw new Error("CLEANUP_SECRET environment variable is required");
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { error: "Missing token parameter" },
        { status: 400 }
      );
    }

    let isValid: boolean;
    try {
      isValid = await bcrypt.compare(CLEANUP_SECRET, token);
    } catch (bcryptError) {
      return NextResponse.json(
        { error: "Invalid token format" },
        { status: 400 }
      );
    }

    if (!isValid) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const result = await cleanupUnverifiedUsers();

    return NextResponse.json(
      {
        success: true,
        deletedCount: result.deletedCount,
        deletedLinksCount: result.deletedLinksCount,
        deletedNotificationsCount: result.deletedNotificationsCount,
        deletedLinkRequestsCount: result.deletedLinkRequestsCount,
        updatedUsersCount: result.updatedUsersCount,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Internal Server Error", details: message },
      { status: 500 }
    );
  }
}

