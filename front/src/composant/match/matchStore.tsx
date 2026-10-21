import { create } from "zustand";
import { UserType } from "@/src/type/user";

interface MatchState {
  currentIndex: number;
  profiles: UserType[];
  nextProfile: () => void;
  resetProfiles: () => void;
}

export const useMatch = create<MatchState>((set) =>  ({
  currentIndex: 0,
  profiles: [],
  nextProfile: () => set((state) => ({ 
    currentIndex: state.currentIndex + 1 
  })),
  resetProfiles: () => set({ 
    currentIndex: 0, 
    profiles: [] 
  }),
}));
