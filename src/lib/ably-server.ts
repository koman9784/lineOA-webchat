
import "server-only";
import { createHttpClient } from "@ably/pubsub-server";

const apiKey = process.env.ABLY_API_KEY;

if (!apiKey) {
  throw new Error("Missing ABLY_API_KEY");
}

export const ablyServer = createHttpClient({
  key: apiKey,
});

export const chatChannel = ablyServer.channels.get("line-chat");
