import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import { requireAuth } from "@/lib/auth";
import { User } from "@/models/User";

export async function PATCH(req: Request) {
  await dbConnect();

  try {
    const authUser = await requireAuth();
    const userId = authUser._id;

    const body = await req.json();

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Only update allowed fields
    const updatableFields: Array<keyof typeof body> = [
      "username",
      "name",
      "bio",
      "location",
      "user_avatar",
    ];

    updatableFields.forEach((field) => {
      if (field in body) {
        user[field] = body[field];
      }
    });

    await user.save();

    const updatedUser = await User.findById(userId).select("-password -__v");

    return NextResponse.json({
      success: true,
      user: updatedUser,
    });
  } catch (err: any) {
    console.error("Update profile API error:", err);
    return NextResponse.json(
      { error: "Failed to update profile", detail: err?.message ?? String(err) },
      { status: 500 }
    );
  }
}
