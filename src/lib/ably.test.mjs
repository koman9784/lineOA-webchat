import assert from "node:assert/strict";
import { mock, test } from "node:test";

const clients = [];

mock.module("@ably/pubsub-device", {
  exports: {
    createClient: () => {
      const client = {
        connection: {
          state: "connecting",
          on: mock.fn(),
          off: mock.fn(),
        },
        close: mock.fn(),
      };
      clients.push(client);
      return client;
    },
  },
});

const {
  createAblyClient,
  getConnectionSnapshot,
  subscribeToConnection,
} = await import("./ably.ts");

test("reuses the client during an immediate cleanup and resubscription", async () => {
  const onChange = mock.fn();
  const unsubscribe = subscribeToConnection(onChange);
  const client = createAblyClient();

  unsubscribe();
  const unsubscribeAgain = subscribeToConnection(onChange);
  await Promise.resolve();

  assert.equal(createAblyClient(), client);
  assert.equal(clients.length, 1);
  assert.equal(client.close.mock.callCount(), 0);
  assert.equal(client.connection.off.mock.calls[0].arguments[0], onChange);

  unsubscribeAgain();
  await Promise.resolve();
  assert.equal(client.close.mock.callCount(), 1);
});

test("keeps the connection open until the last subscriber leaves", async () => {
  const unsubscribeFirst = subscribeToConnection(mock.fn());
  const unsubscribeLast = subscribeToConnection(mock.fn());
  const client = createAblyClient();
  client.connection.state = "connected";

  assert.equal(getConnectionSnapshot(), true);
  unsubscribeFirst();
  await Promise.resolve();
  assert.equal(client.close.mock.callCount(), 0);

  unsubscribeLast();
  assert.equal(client.close.mock.callCount(), 0);
  await Promise.resolve();
  assert.equal(client.close.mock.callCount(), 1);
  assert.equal(getConnectionSnapshot(), false);

  const unsubscribeNew = subscribeToConnection(mock.fn());
  assert.notEqual(createAblyClient(), client);
  unsubscribeNew();
  await Promise.resolve();
});

test("closes only once when multiple cleanups are queued", async () => {
  const unsubscribe = subscribeToConnection(mock.fn());
  const client = createAblyClient();
  unsubscribe();

  const unsubscribeAgain = subscribeToConnection(mock.fn());
  unsubscribeAgain();
  await Promise.resolve();

  assert.equal(client.close.mock.callCount(), 1);
});
