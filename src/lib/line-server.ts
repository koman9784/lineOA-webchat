const LINE_API_URL = "https://api.line.me";

const accessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;

if (!accessToken) {
    throw new Error("Missing LINE_CHANNEL_ACCESS_TOKEN");
}

export async function getLineProfile(userId: string) {
    const response = await fetch(
        `${LINE_API_URL}/v2/bot/profile/${userId}`,
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
            cache: "no-store",
        }
    );

    if (!response.ok) {
        throw new Error("Failed to get LINE profile");
    }

    return response.json();
}

export async function sendLineMessage(
    userId: string,
    message: string
) {
    const response = await fetch(
        `${LINE_API_URL}/v2/bot/message/push`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
                to: userId,
                messages: [
                    {
                        type: "text",
                        text: message,
                    },
                ],
            }),
        }
    );

    if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
    }

    return true;
}