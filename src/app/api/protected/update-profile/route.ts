import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import { requireAuth } from "@/lib/auth";
import { User } from "@/models/User";
import { cookies } from "next/headers";

type UpdatableUserFields = {
  username?: string;
  name?: string;
  bio?: string;
  location?: string;
  user_avatar?: string;
  sex?: string;
};

export async function PATCH(req: Request) {
  await dbConnect();

  const cookieStore = await cookies();

  try {
    const authUser = requireAuth(cookieStore);
    const userId = authUser.userId;

    const body = (await req.json()) as UpdatableUserFields;

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updatableFields = [
      "username",
      "name",
      "bio",
      "location",
      "user_avatar",
      "sex",
    ] as const;

    updatableFields.forEach((field) => {
      const value = body[field];
      if (value !== undefined) {
        user[field] = value;
      }
    });

    await user.save();

    const updatedUser = await User.findById(userId).select("-password -__v");

    return NextResponse.json({
      success: true,
      user: updatedUser,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";

    return NextResponse.json(
      { error: "Failed to update profile", detail: message },
      { status: 500 }
    );
  }
}
