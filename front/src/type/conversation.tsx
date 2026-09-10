export interface UserConversationType {
  userId: number;
  userName: string;
  lastMessage: string;
  lastMessageDate: string;
  isRead: boolean;
}

export interface MessageType {
  id: number;
  senderId: number;
  message: string;
  messageDate: string;
}
