import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { dbConnect } from "@/lib/dbConnect";
import { User } from "@/models/User";
import { deleteAuthCookies } from "@/lib/cookies";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  try {
    await dbConnect();

    const cookieStore = await cookies();
    const token = cookieStore.get("refreshToken")?.value;

    if (token) {
      const user = await User.findOne({ refreshToken: token });
      if (user) {
        user.refreshToken = undefined;
        await user.save();
      }
    }

    const res = NextResponse.json({
      ok: true,
      message: "Signed out successfully",
    });

    deleteAuthCookies(res);

    return res;
  } catch (err: unknown) {

    const message =
      err instanceof Error ? err.message : "Unexpected server error";

    return NextResponse.json(
      { error: "Server error", details: message },
      { status: 500 }
    );
  }
}
