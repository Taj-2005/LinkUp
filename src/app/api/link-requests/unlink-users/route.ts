import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { requireAuth } from "@/lib/auth";
import { dbConnect } from "@/lib/dbConnect";
import { User } from "@/models/User";

export async function POST(req: Request) {
    await dbConnect();

    const cookieStore = await cookies();

    try {
        const payload = requireAuth(cookieStore);
        const { otherUserId } = await req.json();

        if (!otherUserId) {
            return NextResponse.json({ error: "Other user ID is required" }, { status: 400 });
        }

        // Remove from linked arrays
        await User.findByIdAndUpdate(payload.userId, {
            $pull: { linked_to: otherUserId, linked_by: otherUserId },
        });

        await User.findByIdAndUpdate(otherUserId, {
            $pull: { linked_to: payload.userId, linked_by: payload.userId },
        });

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to unlink users" },
            { status: 400 }
        );
    }
}

