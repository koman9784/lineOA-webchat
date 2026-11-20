import "server-only";
import Ably from "ably";

const apiKey = process.env.ABLY_API_KEY;

if (!apiKey) {
  throw new Error("Missing ABLY_API_KEY");
}

export const ablyServer = new Ably.Rest({
  key: apiKey,
});

export const chatChannel = ablyServer.channels.get("line-chat");