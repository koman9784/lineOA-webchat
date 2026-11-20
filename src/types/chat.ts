
export interface ChatUser {
    userId: string;
    displayName: string;
    pictureUrl?: string;
    lastMessage?: string;
    lastMessageAt?: number;
}

export interface ChatMessage {
    id: string;
    userId: string;
    text: string;
    sender: "user" | "admin";
    timestamp: number;
}

export interface IncomingEvent {
    type: "message" | "follow";
    user: ChatUser;
    message: ChatMessage | null;
}

export interface OutgoingEvent {
    userId: string;
    message: ChatMessage;
}
