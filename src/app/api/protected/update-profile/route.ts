import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import { requireAuth } from "@/lib/auth";
import { User } from "@/models/User";
import { cookies } from "next/headers";

const SOCKET_SERVER_URL = process.env.NEXT_PUBLIC_SOCKET_SERVER_URL!

type UpdatableUserFields = {
  username?: string;
  name?: string;
  bio?: string;
  location?: string;
  user_avatar?: string;
  sex?: string;
  accountPrivacy?: "public" | "private";
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
      "accountPrivacy",
    ] as const;

    updatableFields.forEach((field) => {
      const value = body[field];
      if (value !== undefined) {
        user[field] = value;
      }
    });

    await user.save();

    const updatedUser = await User.findById(userId).select("-password -__v");

    try {
        await fetch(`${SOCKET_SERVER_URL}/api/users/profile-updated-notify`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                userId: userId
            }),
        }).catch(() => {

        });
    } catch (socketError) {

        console.error("Socket notification error (non-critical):", socketError);
    }

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
