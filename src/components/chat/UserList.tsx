"use client";

import { Avatar, Badge, Empty, Input, List, Typography } from "antd";
import { SearchOutlined, UserOutlined } from "@ant-design/icons";
import { useMemo, useState } from "react";
import type { ChatUser } from "@/types/chat";

const { Text } = Typography;

interface Props {
  users: ChatUser[];
  selectedUserId: string | null;
  onSelect: (user: ChatUser) => void;
  connected: boolean;
}

export default function UserList({
  users,
  selectedUserId,
  onSelect,
  connected,
}: Props) {
  const [search, setSearch] = useState("");

  const filteredUsers = useMemo(
    () =>
      users.filter((user) =>
        user.displayName.toLowerCase().includes(search.toLowerCase()),
      ),
    [users, search],
  );

  return (
    <div className="user-list">
      <div className="user-list-header">
        <Typography.Title level={4} style={{ margin: 0 }}>
          Messages
        </Typography.Title>

        <Badge
          status={connected ? "success" : "error"}
          text={connected ? "Connected" : "Disconnected"}
        />
      </div>

      <Input
        placeholder="ค้นหาผู้ใช้งาน"
        prefix={<SearchOutlined />}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ marginBottom: 16 }}
      />

      {filteredUsers.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="ยังไม่มีข้อความ"
        />
      ) : (
        <List
          dataSource={filteredUsers}
          renderItem={(user) => (
            <List.Item
              onClick={() => onSelect(user)}
              className={`user-list-item ${
                selectedUserId === user.userId ? "active" : ""
              }`}
            >
              <List.Item.Meta
                avatar={
                  <Avatar
                    src={user.pictureUrl}
                    icon={<UserOutlined />}
                    size={44}
                  />
                }
                title={user.displayName}
                description={
                  <Text type="secondary" ellipsis>
                    {user.lastMessage || "เริ่มการสนทนา"}
                  </Text>
                }
              />
            </List.Item>
          )}
        />
      )}
    </div>
  );
}
