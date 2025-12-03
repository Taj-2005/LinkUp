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
        const { requestId, requesterId } = await req.json();

        if (!requestId || !requesterId) {
            return NextResponse.json({ error: "Request ID and Requester ID are required" }, { status: 400 });
        }

        await User.findByIdAndUpdate(payload.userId, {
            $addToSet: { linked_by: requesterId },
        });

        await User.findByIdAndUpdate(requesterId, {
            $addToSet: { linked_to: payload.userId },
        });

        try {
            await fetch(`${SOCKET_SERVER_URL}/api/link-requests/link-accepted-notify`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    requesterId: requesterId,
                    receiverId: payload.userId,
                    requestId: requestId
                }),
            }).catch(() => {

            });
        } catch (socketError) {

            console.error("Socket notification error (non-critical):", socketError);
        }

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to update users" },
            { status: 400 }
        );
    }
}
