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

function createCursor(user: { createdAt: Date | string; _id: string | mongoose.Types.ObjectId }): string {
  const createdAtDate = user.createdAt instanceof Date ? user.createdAt : new Date(user.createdAt);
  const cursor: Cursor = {
    createdAt: createdAtDate.toISOString(),
    _id: String(user._id),
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
    const cursorParam = searchParams.get("cursor");
    const cursor = parseCursor(cursorParam);

    const query: mongoose.FilterQuery<typeof User> = {
      _id: { $ne: currentUser._id },
      isVerified: true,
    };

    if (cursor) {
      const cursorCreatedAt = new Date(cursor.createdAt);
      const cursorId = new mongoose.Types.ObjectId(cursor._id);
      
      query.$or = [
        { createdAt: { $lt: cursorCreatedAt } },
        {
          $and: [
            { createdAt: cursorCreatedAt },
            { _id: { $lt: cursorId } },
          ],
        },
      ];
    }

    const users = await User.find(query)
      .select("username user_avatar name _id createdAt")
      .sort({ createdAt: -1, _id: -1 })
      .limit(11)
      .lean();

    const hasMore = users.length > 10;
    const paginatedUsers = hasMore ? users.slice(0, 10) : users;

    let nextCursor: string | null = null;
    if (hasMore && paginatedUsers.length > 0) {
      const lastUser = paginatedUsers[paginatedUsers.length - 1];
      if (lastUser && lastUser.createdAt) {
        const lastUserId = lastUser._id instanceof mongoose.Types.ObjectId
          ? lastUser._id.toString()
          : String(lastUser._id);
        nextCursor = createCursor({
          createdAt: lastUser.createdAt,
          _id: lastUserId,
        });
      }
    }

    return NextResponse.json(
      {
        users: paginatedUsers,
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

