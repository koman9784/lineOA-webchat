"use client";

import { useState } from "react";
import { Layout } from "antd";
import UserList from "@/components/chat/UserList";
import ChatWindow from "@/components/chat/ChatWindow";
import { useChat } from "@/hooks/useChat";
import type { ChatUser } from "@/types/chat";

const { Sider, Content } = Layout;

export default function ChatPage() {
  const { users, messages, connected } = useChat();

  const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null);

  return (
    <Layout className="chat-layout">
      <Sider width={320} theme="light" className="chat-sidebar">
        <UserList
          users={users}
          selectedUserId={selectedUser?.userId ?? null}
          onSelect={setSelectedUser}
          connected={connected}
        />
      </Sider>

      <Content className="chat-content">
        <ChatWindow user={selectedUser} messages={messages} />
      </Content>
    </Layout>
  );
}
