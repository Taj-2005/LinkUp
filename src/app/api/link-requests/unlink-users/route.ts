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

        const currentUser = await User.findById(payload.userId);
        const otherUser = await User.findById(otherUserId);

        if (!currentUser || !otherUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Determine the relationship direction
        // If current user has otherUserId in linked_to, current user was the requester
        // If current user has otherUserId in linked_by, other user was the requester
        
        // Remove from current user's linked_to (if current user initiated the link)
        if (currentUser.linked_to.includes(otherUserId)) {
            await User.findByIdAndUpdate(payload.userId, {
                $pull: { linked_to: otherUserId },
            });
            // Remove current user from other user's linked_by
            await User.findByIdAndUpdate(otherUserId, {
                $pull: { linked_by: payload.userId },
            });
        }
        
        // Remove from current user's linked_by (if other user initiated the link)
        if (currentUser.linked_by.includes(otherUserId)) {
            await User.findByIdAndUpdate(payload.userId, {
                $pull: { linked_by: otherUserId },
            });
            // Remove current user from other user's linked_to
            await User.findByIdAndUpdate(otherUserId, {
                $pull: { linked_to: payload.userId },
            });
        }

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to unlink users" },
            { status: 400 }
        );
    }
}

