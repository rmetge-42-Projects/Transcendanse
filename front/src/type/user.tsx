export interface UserType {
  id: number;
  username: string;
  biography?: string;
  kind: string;
  orientation: string;
  photo?: string | null;
  isOnline?: boolean;
  isActive?: boolean;
  isBlocked?: boolean;
  unreadCount?: number;
  lastMessage?: string;
  isNewMatch?: boolean;
}
