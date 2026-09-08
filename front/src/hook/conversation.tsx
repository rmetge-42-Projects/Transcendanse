import { useQuery } from '@tanstack/react-query';
import { api } from '@/src/lib/axios';
import { UserConversationType, MessageType } from '../type/conversation';

export function useConversation() {
  return useQuery<UserConversationType[]>({
    queryKey: ['messagerie'],
    queryFn: async () => {
      const res = await api.get<UserConversationType[]>('/message/conversation');
      return res.data;
    },
  });
}

export function useMessages(userId?: number) {
  return useQuery<MessageType[]>({
    queryKey: ['messages', userId],
    queryFn: async () => {
      const res = await api.get<MessageType[]>(`/message/${userId}`);
      return res.data;
    },
    enabled: !!userId, // Ne lance la requête que si un userId est fourni
  });
}
