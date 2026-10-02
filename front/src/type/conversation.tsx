export interface UserConversationType {
  userId: number;
  userName: string;
  lastMessage: string;
  lastMessageDate: string;
  unreadCount: number;
  isOnline?: boolean;
  isActive?: boolean;
}

// export interface MessageType {
//   id: number;
//   senderId: number;
//   message: string;
//   messageDate: string;
// }

export interface MessageType {
  id: number;
  senderId: number;
  receiverId: number;
  content: string;
  createdAt: string;
  isRead: boolean;
}
