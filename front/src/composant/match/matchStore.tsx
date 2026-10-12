import { create } from "zustand";
import { UserType } from "@/src/type/user";

type DeckUpdater = UserType[] | ((currentDeck: UserType[]) => UserType[]);

interface MatchState {
  deck: UserType[];
  setDeck: (deckOrUpdater: DeckUpdater) => void;
  clearDeck: () => void;
}

export const useMatch = create<MatchState>((set) => ({
  deck: [],

  setDeck: (deckOrUpdater) =>
    set((state) => ({
      deck:
        typeof deckOrUpdater === "function"
          ? deckOrUpdater(state.deck)
          : deckOrUpdater,
    })),

  clearDeck: () => set({ deck: [] }),
}));