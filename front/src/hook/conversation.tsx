import { useQuery } from '@tanstack/react-query';
import { api } from '@/src/lib/axios';
import { ConversationType } from '../type/conversation';

export function conversation() {
  return useQuery({
    queryKey: ['conversation'],
    queryFn: async () => {
      const res = await api.get('/message/conversation');
      return res.data;
    },
  });
}