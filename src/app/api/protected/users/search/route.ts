import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { requireAuth } from "@/lib/auth";
import { dbConnect } from "@/lib/dbConnect";
import { User } from "@/models/User";
import mongoose from "mongoose";

interface Cursor {
  createdAt: string;
  _id: string;
}

function parseCursor(cursor: string | null): Cursor | null {
  if (!cursor) return null;
  try {
    const decoded = Buffer.from(cursor, "base64").toString("utf-8");
    const parsed = JSON.parse(decoded);
    if (parsed.createdAt && parsed._id) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

function createCursor(user: { createdAt: Date; _id: string }): string {
  const cursor: Cursor = {
    createdAt: user.createdAt.toISOString(),
    _id: user._id.toString(),
  };
  return Buffer.from(JSON.stringify(cursor)).toString("base64");
}

export async function GET(req: NextRequest) {
  await dbConnect();

  const cookieStore = await cookies();

  try {
    const auth = requireAuth(cookieStore);
    const currentUser = await User.findById(auth.userId);

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";
    const cursorParam = searchParams.get("cursor");
    const cursor = parseCursor(cursorParam);

    if (!query.trim()) {
      return NextResponse.json(
        { error: "Search query required" },
        { status: 400 }
      );
    }

    const searchQuery: mongoose.FilterQuery<typeof User> = {
      _id: { $ne: currentUser._id },
      isVerified: true,
      $or: [
        { username: { $regex: `^${query}`, $options: "i" } },
        { name: { $regex: `^${query}`, $options: "i" } },
      ],
    };

    if (cursor) {
      searchQuery.$and = [
        {
          $or: [
            {
              createdAt: { $lt: new Date(cursor.createdAt) },
            },
            {
              createdAt: new Date(cursor.createdAt),
              _id: { $lt: new mongoose.Types.ObjectId(cursor._id) },
            },
          ],
        },
      ];
    }

    const users = await User.find(searchQuery)
      .select("bio createdAt linked_by linked_to links location name sex user_avatar username _id accountPrivacy")
      .sort({ createdAt: -1, _id: -1 })
      .limit(10)
      .lean();

    const lastUser = users[users.length - 1];
    const nextCursor =
      users.length === 10 && lastUser && lastUser.createdAt
        ? createCursor({
            createdAt: new Date(lastUser.createdAt),
            _id: String(lastUser._id),
          })
        : null;

    return NextResponse.json(
      {
        users,
        nextCursor,
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

