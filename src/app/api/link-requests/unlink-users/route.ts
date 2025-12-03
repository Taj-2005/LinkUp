import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { requireAuth } from "@/lib/auth";
import { dbConnect } from "@/lib/dbConnect";
import { User } from "@/models/User";

const SOCKET_SERVER_URL = process.env.NEXT_PUBLIC_SOCKET_SERVER_URL!

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

        let unlinked = false;

        if (currentUser.linked_to.includes(otherUserId)) {

            await User.findByIdAndUpdate(payload.userId, {
                $pull: { linked_to: otherUserId },
            });

            await User.findByIdAndUpdate(otherUserId, {
                $pull: { linked_by: payload.userId },
            });
            unlinked = true;
        }

        if (currentUser.linked_by.includes(otherUserId)) {

            await User.findByIdAndUpdate(payload.userId, {
                $pull: { linked_by: otherUserId },
            });

            await User.findByIdAndUpdate(otherUserId, {
                $pull: { linked_to: payload.userId },
            });
            unlinked = true;
        }

        if (!unlinked) {
            return NextResponse.json({ error: "Users are not linked" }, { status: 400 });
        }

        try {
            await fetch(`${SOCKET_SERVER_URL}/api/link-requests/unlink-notify`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    currentUserId: payload.userId,
                    otherUserId: otherUserId
                }),
            }).catch(() => {

            });
        } catch (socketError) {

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
