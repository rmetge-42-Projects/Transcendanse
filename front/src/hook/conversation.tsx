import { useQuery } from '@tanstack/react-query';
import { api } from '@/src/lib/axios';
import { getAuthToken } from '@/src/lib/authToken';
import { UserConversationType, MessageType } from '../type/conversation';
import { UserType } from '@/src/type/user';

const hasToken = () => !!getAuthToken();

export function useConversation() {
  const authenticated = hasToken();
  return useQuery<UserConversationType[]>({
    queryKey: ['conversation'],
    queryFn: async () => {
      const res = await api.get<UserConversationType[]>('/message/conversation');
      return res.data;
    },
    enabled: authenticated,
    retry: (count, err: any) => err?.response?.status !== 401 && count < 2,
  });
}

export function useMatches(enabled: boolean = true) {
  const authenticated = hasToken();
  return useQuery<UserType[]>({
    queryKey: ['matches'],
    queryFn: async () => {
      const res = await api.get<UserType[]>('/match');
      return res.data;
    },
    enabled: enabled && authenticated,
    refetchInterval: authenticated ? 10000 : false,
    retry: (count, err: any) => err?.response?.status !== 401 && count < 2,
  });
}

export function useMessages(userId?: number) {
  const authenticated = hasToken();
  return useQuery<MessageType[]>({
    queryKey: ['discution', userId],
    queryFn: async () => {
      const res = await api.get<MessageType[]>(`/message/${userId}`);
      return res.data;
    },
    enabled: !!userId && authenticated,
    staleTime: 0,
    retry: (count, err: any) => err?.response?.status !== 401 && count < 2,
  });
}
