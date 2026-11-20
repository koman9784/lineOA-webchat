import { NextRequest, NextResponse } from "next/server";

import { sendLineMessage } from "@/lib/line-server";
import { chatChannel } from "@/lib/ably-server";

export async function POST(request: NextRequest) {
    try {
        const { userId, text } = await request.json();

        if (
            typeof userId !== "string" ||
            !/^U[0-9a-f]{32}$/i.test(userId) ||
            typeof text !== "string" ||
            !text.trim() ||
            text.length > 5000
        ) {
            return NextResponse.json(
                { error: "Invalid userId or message" },
                { status: 400 }
            );
        }

        // 1. ส่งข้อความไป LINE OA
        await sendLineMessage(userId, text.trim());

        // 2. แจ้ง Browser ว่า Admin ส่งข้อความแล้ว
        try {
            await chatChannel.publish("outgoing", {
                userId,
                message: {
                    id: crypto.randomUUID(),
                    userId,
                    text: text.trim(),
                    sender: "admin",
                    timestamp: Date.now(),
                },
            });
        } catch (error) {
            console.error("Ably publish error:", error);
        }

        return NextResponse.json({
            success: true,
        });
    } catch (error) {
        console.error("Send Message Error:", error);

        return NextResponse.json(
            { error: "Failed to send message" },
            { status: 500 }
        );
    }
}