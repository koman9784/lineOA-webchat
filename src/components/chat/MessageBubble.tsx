"use client";

import { Typography } from "antd";
import type { ChatMessage } from "@/types/chat";

const { Text } = Typography;

export default function MessageBubble({ message }: { message: ChatMessage }) {
  const isAdmin = message.sender === "admin";

  return (
    <div className={`message-row ${isAdmin ? "admin" : "user"}`}>
      <div className={`message-bubble ${isAdmin ? "admin" : "user"}`}>
        <div>{message.text}</div>

        <Text
          type="secondary"
          style={{
            display: "block",
            fontSize: 11,
            textAlign: "right",
            marginTop: 5,
          }}
        >
          {new Date(message.timestamp).toLocaleTimeString("th-TH", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      </div>
    </div>
  );
}
