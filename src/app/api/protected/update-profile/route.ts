import { NextResponse } from "next/server";
import { withAuth } from "@/lib/withAuth";
import { User } from "@/models/User";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(req: Request) {
  const response = await withAuth(async (authUser) => {
    const userId = authUser._id;
    const body = await req.json();

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const allowed: Array<keyof typeof body> = [
      "username",
      "name",
      "bio",
      "location",
      "user_avatar",
    ];

    for (const field of allowed) {
      if (field in body) {
        user[field] = body[field];
      }
    }

    await user.save();

    const updatedUser = await User.findById(userId).select("-password -__v");

    return NextResponse.json(
      {
        success: true,
        user: updatedUser,
      },
      { status: 200 }
    );
  });

  return response;
}
