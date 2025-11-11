import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { dbConnect } from "@/lib/dbConnect";
import { User } from "@/models/User";

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

    const res = NextResponse.json({ ok: true, message: "Signed out successfully" });
    res.cookies.delete("refreshToken");
    res.cookies.delete("accessToken");
    return res;
  } catch (err) {
    console.error("Signout error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
