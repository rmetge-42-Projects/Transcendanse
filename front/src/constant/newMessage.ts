import { create } from 'zustand';

interface MessageState {
  messageCount: number;
  setMessageCount: (count: number) => void;
  incrementMessageCount: () => void;
  resetMessageCount: () => void;
}

export const useMessageStore = create<MessageState>((set) => ({
  messageCount: 0, // Valeur initiale

  // Définit une valeur exacte (ex: reçue depuis le serveur)
  setMessageCount: (count) => set({ messageCount: count }),

  // Ajoute +1 lors de la réception d'un nouveau WebSockets/Notification
  incrementMessageCount: () =>
    set((state) => ({ messageCount: state.messageCount + 1 })),

  // Remet le compteur à 0 quand l'utilisateur ouvre ses messages
  resetMessageCount: () => set({ messageCount: 0 }),
}));