
"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import {
  createAblyClient,
  getConnectionSnapshot,
  getServerConnectionSnapshot,
  subscribeToConnection,
} from "@/lib/ably";
import type {
  ChatUser,
  ChatMessage,
  IncomingEvent,
  OutgoingEvent,
} from "@/types/chat";

export function useChat() {
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const connected = useSyncExternalStore(
    subscribeToConnection,
    getConnectionSnapshot,
    getServerConnectionSnapshot
  );

  useEffect(() => {
    const ably = createAblyClient();
    const channel = ably.channels.get("line-chat");

    const updateUser = (user: ChatUser, message?: ChatMessage | null) => {
      setUsers((prev) => {
        const existing = prev.find((item) => item.userId === user.userId);

        const updated: ChatUser = {
          ...existing,
          ...user,
          lastMessage: message?.text ?? existing?.lastMessage,
          lastMessageAt: message?.timestamp ?? existing?.lastMessageAt,
        };

        return [
          updated,
          ...prev.filter((item) => item.userId !== user.userId),
        ];
      });
    };

    const handleIncoming = (event: { data?: IncomingEvent }) => {
      if (event.data == null) {
        console.error("Received incoming chat event without a payload");
        return;
      }

      const { user, message } = event.data;

      updateUser(user, message);

      if (message) {
        setMessages((prev) => {
          if (prev.some((item) => item.id === message.id)) {
            return prev;
          }

          return [...prev, message];
        });
      }
    };

    const handleOutgoing = (event: { data?: OutgoingEvent }) => {
      if (event.data == null) {
        console.error("Received outgoing chat event without a payload");
        return;
      }

      const { userId, message } = event.data;

      setUsers((prev) =>
        prev.map((user) =>
          user.userId === userId
            ? {
                ...user,
                lastMessage: message.text,
                lastMessageAt: message.timestamp,
              }
            : user
        )
      );

      setMessages((prev) => {
        if (prev.some((item) => item.id === message.id)) {
          return prev;
        }

        return [...prev, message];
      });
    };

    void Promise.all([
      channel.subscribe("incoming", handleIncoming),
      channel.subscribe("outgoing", handleOutgoing),
    ]).catch(() => {
      console.error("Failed to subscribe to chat events");
    });

    return () => {
      channel.unsubscribe("incoming", handleIncoming);
      channel.unsubscribe("outgoing", handleOutgoing);
    };
  }, []);

  return {
    users,
    messages,
    connected,
  };
}