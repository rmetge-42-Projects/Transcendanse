export interface UserConversationType {
  userPhoto: string | null | undefined;
  userId: number;
  userName: string;
  lastMessage: string;
  lastMessageDate: string;
  unreadCount: number;
  isOnline?: boolean;
  isActive?: boolean;
  isBlocked?: boolean;
}


export interface MessageType {
  id: number;
  senderId: number;
  receiverId: number;
  content: string;
  createdAt: string;
  isRead: boolean;
}
