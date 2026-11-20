import * as Ably from "ably";

export function createAblyClient() {
  return new Ably.Realtime({
    authUrl: "/api/ably/token",
  });
}