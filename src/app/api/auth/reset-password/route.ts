import { NextResponse } from "next/server";
import {User} from "@/models/User";
import {dbConnect} from "@/lib/dbConnect";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { token, password } = await req.json();

    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() },
    });

    if (!user)
      return NextResponse.json(
        { message: "Invalid or expired token" },
        { status: 400 }
      );

    user.password = await bcrypt.hash(password, 10);
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;

    await user.save();

    return NextResponse.json({ message: "Password updated!" });
  } catch (error) {
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
