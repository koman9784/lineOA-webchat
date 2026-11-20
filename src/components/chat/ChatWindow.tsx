"use client";

import { useEffect, useRef, useState } from "react";
import {
  Avatar,
  Button,
  Empty,
  Input,
  message as notification,
  Spin,
  Typography,
} from "antd";
import { SendOutlined, UserOutlined } from "@ant-design/icons";
import type { ChatMessage, ChatUser } from "@/types/chat";
import MessageBubble from "./MessageBubble";

const { Text } = Typography;

interface Props {
  user: ChatUser | null;
  messages: ChatMessage[];
}

export default function ChatWindow({ user, messages }: Props) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const conversation = messages.filter((item) => item.userId === user?.userId);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation.length]);

  const handleSend = async () => {
    if (!user || !text.trim() || sending) return;

    const messageText = text.trim();
    setSending(true);

    try {
      const response = await fetch("/api/messages/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.userId,
          text: messageText,
        }),
      });

      if (!response.ok) {
        throw new Error("ส่งข้อความไม่สำเร็จ");
      }

      setText("");
    } catch (error) {
      notification.error(
        error instanceof Error
          ? error.message
          : "เกิดข้อผิดพลาดในการส่งข้อความ",
      );
    } finally {
      setSending(false);
    }
  };

  if (!user) {
    return (
      <div className="chat-empty">
        <Empty description="เลือกรายชื่อเพื่อเริ่มสนทนา" />
      </div>
    );
  }

  return (
    <div className="chat-window">
      <div className="chat-header">
        <Avatar src={user.pictureUrl} icon={<UserOutlined />} size={42} />

        <div>
          <Text strong>{user.displayName}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 11 }}>
            LINE Customer
          </Text>
        </div>
      </div>

      <div className="chat-messages">
        {conversation.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="ยังไม่มีข้อความในบทสนทนานี้"
          />
        ) : (
          conversation.map((item) => (
            <MessageBubble key={item.id} message={item} />
          ))
        )}

        <div ref={bottomRef} />
      </div>

      <div className="chat-input">
        <Input.TextArea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onPressEnter={(e) => {
            if (!e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="พิมพ์ข้อความ..."
          autoSize={{ minRows: 1, maxRows: 4 }}
          disabled={sending}
        />

        <Button
          type="primary"
          icon={sending ? <Spin size="small" /> : <SendOutlined />}
          onClick={handleSend}
          disabled={!text.trim() || sending}
        >
          ส่ง
        </Button>
      </div>
    </div>
  );
}
