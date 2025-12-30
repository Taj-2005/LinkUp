import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { requireAuth } from "@/lib/auth";
import { Link } from "@/models/Link";
import { User } from "@/models/User";
import { dbConnect } from "@/lib/dbConnect";
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

function createCursor(link: { createdAt: Date | string; _id: string | mongoose.Types.ObjectId }): string {
  const createdAtDate = link.createdAt instanceof Date ? link.createdAt : new Date(link.createdAt);
  const cursor: Cursor = {
    createdAt: createdAtDate.toISOString(),
    _id: String(link._id),
  };
  return Buffer.from(JSON.stringify(cursor)).toString("base64");
}

export async function GET(req: NextRequest) {
  await dbConnect();

  const cookieStore = await cookies();

  try {
    const payload = requireAuth(cookieStore);
    const currentUserId = payload.userId.toString();

    const { searchParams } = new URL(req.url);
    const cursorParam = searchParams.get("cursor");
    const cursor = parseCursor(cursorParam);

    const currentUser = await User.findById(currentUserId)
      .select("linked_to linked_by")
      .lean();

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const matchStage: mongoose.FilterQuery<typeof Link> = {
      userId: { $ne: currentUserId },
    };

    if (cursor) {
      const cursorCreatedAt = new Date(cursor.createdAt);
      const cursorId = new mongoose.Types.ObjectId(cursor._id);
      
      matchStage.$and = [
        {
          $or: [
            { createdAt: { $lt: cursorCreatedAt } },
            {
              $and: [
                { createdAt: cursorCreatedAt },
                { _id: { $lt: cursorId } },
              ],
            },
          ],
        },
      ];
    }

    const pipeline: mongoose.PipelineStage[] = [
      {
        $match: matchStage,
      },
      {
        $lookup: {
          from: "users",
          let: { linkUserId: "$userId" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: [
                    { $toString: "$_id" },
                    "$$linkUserId",
                  ],
                },
              },
            },
          ],
          as: "userData",
        },
      },
      {
        $unwind: {
          path: "$userData",
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $match: {
          $or: [
            { "userData.accountPrivacy": { $ne: "private" } },
            {
              $and: [
                { "userData.accountPrivacy": "private" },
                { "userData.linked_to": { $in: [currentUserId] } },
                { "userData.linked_by": { $in: [currentUserId] } },
              ],
            },
          ],
        },
      },
      {
        $addFields: {
          userInfo: {
            username: "$userData.username",
            user_avatar: "$userData.user_avatar",
            name: "$userData.name",
          },
        },
      },
      {
        $project: {
          _id: 1,
          userId: 1,
          imageUrl: 1,
          description: 1,
          location: 1,
          likes: 1,
          comments: 1,
          createdAt: 1,
          updatedAt: 1,
          userInfo: 1,
        },
      },
      {
        $sort: {
          createdAt: -1,
          _id: -1,
        },
      },
      {
        $limit: 11,
      },
    ];

    const results = await Link.aggregate(pipeline);

    const hasMore = results.length > 10;
    const paginatedLinks = hasMore ? results.slice(0, 10) : results;

    let nextCursor: string | null = null;
    if (hasMore && paginatedLinks.length > 0) {
      const lastLink = paginatedLinks[paginatedLinks.length - 1];
      if (lastLink && lastLink.createdAt) {
        nextCursor = createCursor({
          createdAt: lastLink.createdAt,
          _id: lastLink._id,
        });
      }
    }

    return NextResponse.json(
      {
        links: paginatedLinks,
        nextCursor,
      },
      { status: 200 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to fetch links";
    const isUnauthorized = errorMessage.includes("Unauthorized");
    
    return NextResponse.json(
      { error: errorMessage },
      { status: isUnauthorized ? 401 : 500 }
    );
  }
}
