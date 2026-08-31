// src/hooks/useUser.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/src/lib/axios';
import { UserType } from '../type/user';

export function useUser() {
  return useQuery({
    queryKey: ['userMe'],
    queryFn: async () => {
      const res = await api.get('/users/me');
      return res.data;
    },
  });
}

export function otherUser() {
  return useQuery<UserType[]>({
    queryKey: ['otherUsers'],
    queryFn: async () => {
      const res = await api.get<UserType[]>('/users/other');
      return res.data;
    },
  });
}