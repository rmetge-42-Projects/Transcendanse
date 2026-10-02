export interface UserType {
  id: number;
  username: string;
  biography?: string;
  kind: string;
  orientation: string;
  isOnline?: boolean;
  isActive?: boolean;
}