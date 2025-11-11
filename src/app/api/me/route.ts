import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  try {
    const user = await requireAuth();

    return NextResponse.json({
      message: "Protected data",
      user,
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Unexpected server error";

    const res = NextResponse.json({ error: message }, { status: 401 });

    res.cookies.delete("accessToken");
    res.cookies.delete("refreshToken");
    window.location.href = "/";
    return res;
  }
}
