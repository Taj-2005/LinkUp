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

    const userCity = (currentUser.location || "").toLowerCase().trim();
    const prefGender =
      currentUser.sex === "male"
        ? "female"
        : currentUser.sex === "female"
        ? "male"
        : null;

    const pipeline: mongoose.PipelineStage[] = [
      {
        $match: {
          _id: { $ne: new mongoose.Types.ObjectId(currentUser._id) },
          isVerified: true,
        },
      },
      {
        $addFields: {
          uCityLower: {
            $toLower: { $ifNull: [{ $trim: { input: "$location" } }, ""] },
          },
          userCityLower: { $literal: userCity },
          currentSex: { $literal: currentUser.sex },
        },
      },
      {
        $addFields: {
          sameCity: {
            $and: [
              { $gt: [{ $strLenCP: "$uCityLower" }, 0] },
              { $gt: [{ $strLenCP: "$userCityLower" }, 0] },
              {
                $or: [
                  { $regexMatch: { input: "$uCityLower", regex: userCity, options: "i" } },
                  { $regexMatch: { input: "$userCityLower", regex: "$uCityLower", options: "i" } },
                ],
              },
            ],
          },
          oppGender: {
            $cond: {
              if: { $eq: ["$currentSex", "male"] },
              then: { $eq: ["$sex", "female"] },
              else: {
                $cond: {
                  if: { $eq: ["$currentSex", "female"] },
                  then: { $eq: ["$sex", "male"] },
                  else: false,
                },
              },
            },
          },
        },
      },
      {
        $addFields: {
          priority: {
            $cond: {
              if: { $and: ["$sameCity", "$oppGender"] },
              then: 1,
              else: {
                $cond: {
                  if: "$sameCity",
                  then: 2,
                  else: {
                    $cond: {
                      if: "$oppGender",
                      then: 3,
                      else: 4,
                    },
                  },
                },
              },
            },
          },
        },
      },
      {
        $sort: {
          priority: 1,
          createdAt: -1,
          _id: -1,
        },
      },
    ];

    if (cursor) {
      const cursorCreatedAt = new Date(cursor.createdAt);
      const cursorId = new mongoose.Types.ObjectId(cursor._id);
      
      const cursorUser = await User.findById(cursor._id).lean();
      if (cursorUser) {
        const cursorUserTyped = cursorUser as { location?: string; sex?: string };
        const cursorUCity = ((cursorUserTyped.location || "").toLowerCase().trim());
        const cursorHasCity = cursorUCity.length > 0;
        const cursorSameCity =
          cursorHasCity &&
          userCity &&
          (cursorUCity.includes(userCity) || userCity.includes(cursorUCity));
        const cursorOppGender = prefGender && cursorUserTyped.sex === prefGender;
        
        let cursorPriority: number;
        if (cursorSameCity && cursorOppGender) {
          cursorPriority = 1;
        } else if (cursorSameCity) {
          cursorPriority = 2;
        } else if (cursorOppGender) {
          cursorPriority = 3;
        } else {
          cursorPriority = 4;
        }

        pipeline.splice(pipeline.length - 1, 0, {
          $match: {
            $or: [
              { priority: { $gt: cursorPriority } },
              {
                $and: [
                  { priority: cursorPriority },
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
                ],
              },
            ],
          },
        });
      }
    }

    pipeline.push(
      {
        $limit: 11,
      },
      {
        $project: {
          bio: 1,
          createdAt: 1,
          linked_by: 1,
          linked_to: 1,
          links: 1,
          location: 1,
          name: 1,
          sex: 1,
          user_avatar: 1,
          username: 1,
          _id: 1,
          accountPrivacy: 1,
        },
      }
    );

    const results = await User.aggregate(pipeline);

    const hasMore = results.length > 10;
    const paginatedUsers = hasMore ? results.slice(0, 10) : results;

    let nextCursor: string | null = null;
    if (hasMore && paginatedUsers.length > 0) {
      const lastUser = paginatedUsers[paginatedUsers.length - 1];
      if (lastUser && lastUser.createdAt) {
        nextCursor = createCursor({
          createdAt: lastUser.createdAt,
          _id: lastUser._id,
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

