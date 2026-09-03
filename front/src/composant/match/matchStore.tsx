import { create } from "zustand";
import { UserType } from "@/src/type/user";

interface MatchState {
  // Les variables
  currentIndex: number;
  profiles: UserType[];
  // Les fonctions
  nextProfile: () => void;
  resetProfiles: () => void;
}

export const useMatch = create<MatchState>((set) =>  ({
  // 1. Les valeurs initiales (au démarrage)
  currentIndex: 0,
  profiles: [],
  // 2. Les fonctions qui utilisent "set" pour modifier les valeurs
  nextProfile: () => set((state) => ({ 
    currentIndex: state.currentIndex + 1 
  })),
  resetProfiles: () => set({ 
    currentIndex: 0, 
    profiles: [] 
  }),
}));
