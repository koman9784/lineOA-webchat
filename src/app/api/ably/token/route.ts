import { NextResponse } from "next/server";
import { ablyServer } from "@/lib/ably-server";

export async function GET() {
    try {
        const tokenRequest =
            await ablyServer.auth.createTokenRequest({
                // เป็น ID ของ Web Chat ไม่ใช่ระบบ Login
                clientId: "line-oa-webchat-admin",

                capability: JSON.stringify({
                    "line-chat": ["subscribe"],
                }),
            });

        return NextResponse.json(tokenRequest);
    } catch (error) {
        console.error("Ably Token Error:", error);

        return NextResponse.json(
            { error: "Failed to create Ably token" },
            { status: 500 }
        );
    }
}