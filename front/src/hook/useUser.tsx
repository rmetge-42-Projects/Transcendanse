// src/hooks/useUser.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/src/lib/axios';
import { UserType } from '../type/user';
import { ActivityType } from '../type/activity';

const hasToken = () => typeof window !== 'undefined' && !!localStorage.getItem('token');

export function useUser() {
  const authenticated = hasToken();
  return useQuery({
    queryKey: ['userMe'],
    queryFn: async () => {
      const res = await api.get('/users/me');
      return res.data;
    },
    enabled: authenticated,
    retry: (count, err: any) => err?.response?.status !== 401 && count < 2,
  });
}

export function useOtherUser() {
  const authenticated = hasToken();
  return useQuery<UserType[]>({
    queryKey: ['otherUsers'],
    queryFn: async () => {
      const res = await api.get<UserType[]>('/match/other');
      return res.data;
    },
    enabled: authenticated,
    refetchInterval: authenticated ? 10000 : false,
    retry: (count, err: any) => err?.response?.status !== 401 && count < 2,
  });
}

export function useMyMatch(userId?: number) {
  const authenticated = hasToken();
  return useQuery({
    queryKey: ['userMyMatch', userId],
    queryFn: async () => {
      const res = await api.get(`/users/${userId}`);
      return res.data;
    },
    enabled: !!userId && authenticated,
    retry: false,
  });
}

export function useActivity() {
  const authenticated = hasToken();
  return useQuery<ActivityType[]>({
    queryKey: ['activity'],
    queryFn: async () => {
      const res = await api.get<ActivityType[]>('/match/activity');
      return res.data;
    },
    enabled: authenticated,
    refetchInterval: authenticated ? 5000 : false,
    refetchOnWindowFocus: authenticated,
    retry: (count, err: any) => err?.response?.status !== 401 && count < 2,
  });
}
