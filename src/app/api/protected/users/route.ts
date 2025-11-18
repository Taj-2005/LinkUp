import { withAuth } from "@/lib/withAuth";
import { User } from "@/models/User";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const response = await withAuth(async (user) => {
    const allUsers = await User.find();
    const users = allUsers.filter((u) => u.username !== user.username);

    return NextResponse.json(users, { status: 200 });
  });

  return response;
}
