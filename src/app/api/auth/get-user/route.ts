import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import { User } from "@/models/User";
import mongoose from "mongoose";

export async function POST(req: Request) {
  await dbConnect();
  const { identifier } = await req.json();

  if (!identifier) {
    return NextResponse.json({ error: "Identifier required" }, { status: 400 });
  }

  let user;

  // Check if identifier is a valid MongoDB ObjectId
  if (mongoose.Types.ObjectId.isValid(identifier)) {
    // Search by _id
    user = await User.findById(identifier).select("-password -__v");
  } else {
    // Search by username or email
    user = await User.findOne({
    $or: [
      { email: identifier.toLowerCase() }, 
      { username: identifier.toLowerCase() }
    ]
  }).select("-password -__v");
  }

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ user });
}
