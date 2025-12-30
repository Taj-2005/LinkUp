import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { requireAuth } from "@/lib/auth";
import { dbConnect } from "@/lib/dbConnect";
import { User } from "@/models/User";
import mongoose from "mongoose";

export async function GET() {
  await dbConnect();

  const cookieStore = await cookies();

  try {
    const auth = requireAuth(cookieStore);
    const currentUser = await User.findById(auth.userId);

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userCity = (currentUser.location || "").toLowerCase().trim();

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
      {
        $limit: 5,
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
      },
    ];

    const results = await User.aggregate(pipeline);

    return NextResponse.json({ users: results }, { status: 200 });
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

