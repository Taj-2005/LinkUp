import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import {User} from "@/models/User";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { username, email } = await req.json();

    if (!username && !email) {
      return NextResponse.json(
        { error: "Missing fields" },
        { status: 400 }
      );
    }

    if (username) {
      const user = await User.findOne({ username: username.toLowerCase() });
      return NextResponse.json({ exists: !!user });
    }

    if (email) {
      const user = await User.findOne({ email });
      return NextResponse.json({ exists: !!user });
    }
  } catch  {
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
