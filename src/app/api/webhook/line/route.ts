import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";

import { chatChannel } from "@/lib/ably-server";
import { getLineProfile } from "@/lib/line-server";

function verifySignature(
    body: string,
    signature: string | null
): boolean {
    const channelSecret = process.env.LINE_CHANNEL_SECRET;

    if (!channelSecret || !signature) {
        return false;
    }

    const hash = createHmac("sha256", channelSecret)
        .update(body)
        .digest("base64");

    const received = Buffer.from(signature);
    const expected = Buffer.from(hash);

    return (
        received.length === expected.length &&
        timingSafeEqual(received, expected)
    );
}

export async function POST(request: NextRequest) {
    try {
        // 1. อ่าน Raw Body
        const body = await request.text();

        // 2. ตรวจสอบ Signature
        const signature = request.headers.get("x-line-signature");

        if (!verifySignature(body, signature)) {
            return NextResponse.json(
                { error: "Invalid signature" },
                { status: 401 }
            );
        }

        // 3. แปลง JSON หลังตรวจสอบ Signature แล้ว
        const webhook = JSON.parse(body);

        // 4. วนลูป Event
        for (const event of webhook.events ?? []) {
            const userId = event.source?.userId;

            if (!userId || event.source?.type !== "user") {
                continue;
            }

            // รับเฉพาะข้อความ Text และการเพิ่มเพื่อน
            const isTextMessage =
                event.type === "message" &&
                event.message?.type === "text";

            const isFollow = event.type === "follow";

            if (!isTextMessage && !isFollow) {
                continue;
            }

            // 5. ดึง Profile
            let profile;

            try {
                profile = await getLineProfile(userId);
            } catch {
                profile = {
                    userId,
                    displayName: "LINE User",
                    pictureUrl: undefined,
                };
            }

            // 6. ส่งข้อมูลไป Ably
            await chatChannel.publish("incoming", {
                type: isFollow ? "follow" : "message",
                user: {
                    userId,
                    displayName: profile.displayName,
                    pictureUrl: profile.pictureUrl,
                },
                message: isTextMessage
                    ? {
                        id: event.message.id,
                        userId,
                        text: event.message.text,
                        sender: "user",
                        timestamp: event.timestamp,
                    }
                    : null,
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("LINE Webhook Error:", error);

        return NextResponse.json(
            { error: "Webhook processing failed" },
            { status: 500 }
        );
    }
}