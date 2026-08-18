// src/hooks/useUser.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/src/lib/axios';

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
  return useQuery({
    queryKey: ['otherUser'],
    queryFn: async () => {
      const res = await api.get('/users/other');
      return res.data;
    },
  });
}