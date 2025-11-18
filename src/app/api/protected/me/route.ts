import { withAuth } from "@/lib/withAuth";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const response = await withAuth(async (user) => {
    return NextResponse.json({
      message: "Protected route",
      user,
    });
  });

  return response;
}
