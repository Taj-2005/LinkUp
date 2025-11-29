import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { requireAuth } from "@/lib/auth";
import { dbConnect } from "@/lib/dbConnect";
import { User } from "@/models/User";

export async function GET() {
  await dbConnect();

  const cookieStore = await cookies();

  try {
    requireAuth(cookieStore);

    const users = await User.find().select("bio createdAt linked_by linked_to links location name sex user_avatar username _id");
    return NextResponse.json(users, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
