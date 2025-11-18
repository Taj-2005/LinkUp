import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { dbConnect } from "@/lib/dbConnect";
import { requireAuth } from "@/lib/requireAuth";
import { validateAndRefreshTokens } from "@/lib/authHelpers";
import { IUser } from "@/models/User";

export async function withAuth(
  handler: (user: IUser) => Promise<NextResponse | object>
) {
  await dbConnect();
  const cookieStore = await cookies();

  try {
    const user = await requireAuth();
    const result = await handler(user);

    return result instanceof NextResponse
      ? result
      : NextResponse.json(result, { status: 200 });
  } catch {
    const refreshToken = cookieStore.get("refreshToken")?.value;

    if (!refreshToken) {
      const res = NextResponse.json(
        { error: "Not authenticated: refresh token missing" },
        { status: 401 }
      );
      res.cookies.delete("accessToken");
      res.cookies.delete("refreshToken");
      return res;
    }

    const result = await validateAndRefreshTokens(refreshToken);

    if (!result.success || !result.user) {
      const res = NextResponse.json(
        { error: result.error || "Session expired" },
        { status: 401 }
      );

      res.cookies.delete("accessToken");
      res.cookies.delete("refreshToken");
      return res;
    }

    const out = await handler(result.user);

    const res =
      out instanceof NextResponse
        ? out
        : NextResponse.json(out, { status: 200 });

    res.cookies.set("accessToken", result.newAccessToken!, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
    });

    res.cookies.set("refreshToken", result.newRefreshToken!, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
    });

    return res;
  }
}
