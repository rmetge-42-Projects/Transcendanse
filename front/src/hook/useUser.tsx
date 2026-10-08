// src/hooks/useUser.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/src/lib/axios';
import { UserType } from '../type/user';
import { ActivityType } from '../type/activity';

export function useUser() {
  return useQuery({
    queryKey: ['userMe'],
    queryFn: async () => {
      const res = await api.get('/users/me');
      return res.data;
    },
  });
}

export function useOtherUser() {
  return useQuery<UserType[]>({
    queryKey: ['otherUsers'],
    queryFn: async () => {
      const res = await api.get<UserType[]>('/match/other');
      return res.data;
    },
    refetchInterval: 10000,
  });
}

export function useMyMatch(userId?: number) {
  return useQuery({
    queryKey: ['userMyMatch', userId],
    queryFn: async () => {
      const res = await api.get(`/users/${userId}`);
      return res.data;
    },
    retry : false,
  });
}

export function useActivity() {
  return useQuery<ActivityType[]>({
    queryKey: ['activity'],
    queryFn: async () => {
      const res = await api.get<ActivityType[]>('/match/activity');
      return res.data;
    },
    refetchInterval: 5000,
    refetchOnWindowFocus: true,
  });
}
