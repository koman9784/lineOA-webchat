export interface ChatUser {
  userId: string;
  displayName: string;
  pictureUrl?: string;
  lastMessage?: string;
}

export interface ChatMessage {
  id: string;
  userId: string;
  text: string;
  sender: "user" | "admin";
  timestamp: number;
}