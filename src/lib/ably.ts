import { createClient } from "@ably/pubsub-device";

let ablyClient: ReturnType<typeof createClient> | null = null;
let connectionSubscribers = 0;

export function createAblyClient() {
  if (!ablyClient) {
    ablyClient = createClient({
      authUrl: "/api/ably/token",
    });
  }
  return ablyClient;
}

export function subscribeToConnection(onChange: () => void) {
  const client = createAblyClient();
  connectionSubscribers += 1;
  client.connection.on(onChange);

  return () => {
    client.connection.off(onChange);
    connectionSubscribers -= 1;
    if (connectionSubscribers === 0) {
      // Allow Strict Mode's immediate resubscription to reuse the connection.
      queueMicrotask(() => {
        if (connectionSubscribers === 0 && ablyClient === client) {
          ablyClient = null;
          client.close();
        }
      });
    }
  };
}

export function getConnectionSnapshot() {
  return ablyClient?.connection.state === "connected";
}

export function getServerConnectionSnapshot() {
  return false;
}
