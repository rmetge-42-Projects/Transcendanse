export interface UserConversationType {
  userId: number;
  userName: string;
  lastMessage: string;
  lastMessageDate: string;
  isRead: boolean;
}

export interface MessageType {
  id: number;
  senderId: string;
  message: string;
  messageDate: string;
}
