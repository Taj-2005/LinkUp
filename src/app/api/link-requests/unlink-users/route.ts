import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { requireAuth } from "@/lib/auth";
import { dbConnect } from "@/lib/dbConnect";
import { User } from "@/models/User";

const SOCKET_SERVER_URL = process.env.SOCKET_SERVER_URL || process.env.NEXT_PUBLIC_SOCKET_SERVER_URL || "http://localhost:3001";

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

        // Correct unlink logic:
        // When User A unlinks User B:
        // - User A removes User B from A's linked_to (if A was the requester)
        // - User B removes User A from B's linked_by (if A was the requester)
        // OR
        // - User A removes User B from A's linked_by (if B was the requester)
        // - User B removes User A from B's linked_to (if B was the requester)
        
        let unlinked = false;

        // Case 1: Current user was the requester (has other in linked_to)
        if (currentUser.linked_to.includes(otherUserId)) {
            // Current user removes other from linked_to
            await User.findByIdAndUpdate(payload.userId, {
                $pull: { linked_to: otherUserId },
            });
            // Other user removes current from linked_by
            await User.findByIdAndUpdate(otherUserId, {
                $pull: { linked_by: payload.userId },
            });
            unlinked = true;
        }
        
        // Case 2: Other user was the requester (current has other in linked_by)
        if (currentUser.linked_by.includes(otherUserId)) {
            // Current user removes other from linked_by
            await User.findByIdAndUpdate(payload.userId, {
                $pull: { linked_by: otherUserId },
            });
            // Other user removes current from linked_to
            await User.findByIdAndUpdate(otherUserId, {
                $pull: { linked_to: payload.userId },
            });
            unlinked = true;
        }

        if (!unlinked) {
            return NextResponse.json({ error: "Users are not linked" }, { status: 400 });
        }

        // Notify Socket.IO server to emit real-time updates
        try {
            await fetch(`${SOCKET_SERVER_URL}/api/link-requests/unlink-notify`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    currentUserId: payload.userId,
                    otherUserId: otherUserId 
                }),
            }).catch(() => {
                // Silently fail - unlink still succeeded
            });
        } catch (socketError) {
            // Silently fail - unlink still succeeded, socket notification is optional
            console.error("Socket notification error (non-critical):", socketError);
        }

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to unlink users" },
            { status: 400 }
        );
    }
}

