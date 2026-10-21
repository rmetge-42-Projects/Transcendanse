import { create } from 'zustand';

interface MessageState {
  messageCount: number;
  setMessageCount: (count: number) => void;
  incrementMessageCount: () => void;
  resetMessageCount: () => void;
}

export const useMessageStore = create<MessageState>((set) => ({
  messageCount: 0,
  setMessageCount: (count) => set({ messageCount: count }),
  incrementMessageCount: () =>
    set((state) => ({ messageCount: state.messageCount + 1 })),
  resetMessageCount: () => set({ messageCount: 0 }),
}));
