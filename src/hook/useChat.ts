"use client";

import { useEffect, useState } from "react";
import { createAblyClient } from "@/lib/ably";
import type { ChatUser, ChatMessage } from "@/types/chat";

type IncomingPayload = {
    user: ChatUser;
    message?: ChatMessage;
};

type OutgoingPayload = {
    message: ChatMessage;
};

type AblyEvent = {
    data?: unknown;
};

export function useChat() {
    const [users, setUsers] = useState<ChatUser[]>([]);
    const [messages, setMessages] = useState<ChatMessage[]>([]);

    useEffect(() => {
        const ably = createAblyClient();
        const channel = ably.channels.get("line-chat");

        const handleIncoming = (event: AblyEvent) => {
            const payload = event.data as IncomingPayload | undefined;
            if (!payload) return;

            const { user, message } = payload;

            setUsers((previousUsers) => {
                const exists = previousUsers.some(
                    (item) => item.userId === user.userId
                );

                if (exists) {
                    return previousUsers.map((item) =>
                        item.userId === user.userId
                            ? {
                                  ...item,
                                  ...user,
                                  lastMessage:
                                      message?.text ?? item.lastMessage,
                              }
                            : item
                    );
                }

                return [
                    ...previousUsers,
                    { ...user, lastMessage: message?.text },
                ];
            });

            if (message) {
                setMessages((previousMessages) => [
                    ...previousMessages,
                    message,
                ]);
            }
        };

        const handleOutgoing = (event: AblyEvent) => {
            const payload = event.data as OutgoingPayload | undefined;
            if (!payload) return;

            setMessages((previousMessages) => [
                ...previousMessages,
                payload.message,
            ]);
        };

        channel.subscribe("incoming", handleIncoming);
        channel.subscribe("outgoing", handleOutgoing);

        return () => {
            channel.unsubscribe("incoming", handleIncoming);
            channel.unsubscribe("outgoing", handleOutgoing);
            ably.close();
        };
    }, []);

    return {
        users,
        messages,
        setMessages,
    };
}