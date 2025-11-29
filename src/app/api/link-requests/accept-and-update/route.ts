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
        const { requestId, requesterId } = await req.json();

        if (!requestId || !requesterId) {
            return NextResponse.json({ error: "Request ID and Requester ID are required" }, { status: 400 });
        }

        // Update user arrays
        await User.findByIdAndUpdate(payload.userId, {
            $addToSet: { linked_by: requesterId },
        });

        await User.findByIdAndUpdate(requesterId, {
            $addToSet: { linked_to: payload.userId },
        });

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to update users" },
            { status: 400 }
        );
    }
}

