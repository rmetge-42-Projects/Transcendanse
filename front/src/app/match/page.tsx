"use client";

import { useOtherUser, useUser } from "@/src/hook/useUser";
import type { UserType } from "@/src/type/user";
import ProfileCard from "@/src/composant/profile/ProfileCard";
import IfIsError from "@/src/constant/ifIsError";
import IfIsLoading from "@/src/constant/ifIsLoaging";
import MatchProfile from "@/src/composant/match/matchProfile";
import { Heart, X, HeartPlus } from "lucide-react";
import { api } from "@/src/lib/axios";
import { useEffect, useMemo, useState } from "react";
import Bottom from "@/src/display/bottom";
import Navigation from "@/src/display/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { getErrorMessage } from "@/src/lib/errors";

const DECK_STORAGE_KEY = "matchDeckState";
// const REJECT_DURATION_MS = 30 * 60 * 1000;
const REJECT_DURATION_MS = 5 * 1000;
const REJECT_CHECK_INTERVAL_MS = 1000;

type RejectedProfiles = Record<string, number>;

type DeckState = {
  orderedIds: number[];
  currentId: number | null;
  rejectedUntil: RejectedProfiles;
};

function getDeckStorageKey(currentUserId: number) {
  return `${DECK_STORAGE_KEY}:${currentUserId}`;
}

function createEmptyDeckState(): DeckState {
  return {
    orderedIds: [],
    currentId: null,
    rejectedUntil: {},
  };
}

function readDeckState(currentUserId: number): DeckState {
  if (typeof window === "undefined") return createEmptyDeckState();

  try {
    const saved = window.sessionStorage.getItem(getDeckStorageKey(currentUserId));
    const parsed = saved ? JSON.parse(saved) : createEmptyDeckState();

    return {
      orderedIds: Array.isArray(parsed.orderedIds) ? parsed.orderedIds : [],
      currentId: typeof parsed.currentId === "number" ? parsed.currentId : null,
      rejectedUntil:
        parsed.rejectedUntil && typeof parsed.rejectedUntil === "object"
          ? parsed.rejectedUntil
          : {},
    };
  } catch {
    window.sessionStorage.removeItem(getDeckStorageKey(currentUserId));
    return createEmptyDeckState();
  }
}

function saveDeckState(currentUserId: number, deckState: DeckState) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(
    getDeckStorageKey(currentUserId),
    JSON.stringify(deckState),
  );
}

function areDeckStatesEqual(first: DeckState | null, second: DeckState) {
  if (!first) return false;

  return (
    first.currentId === second.currentId &&
    JSON.stringify(first.orderedIds) === JSON.stringify(second.orderedIds) &&
    JSON.stringify(first.rejectedUntil) === JSON.stringify(second.rejectedUntil)
  );
}

function uniqueIds(ids: number[]) {
  return ids.filter((id, index) => ids.indexOf(id) === index);
}

function getNextRejectedExpiry(deckState: DeckState | null, now: number) {
  if (!deckState) return null;

  const activeExpiryTimes = Object.values(deckState.rejectedUntil)
    .map(Number)
    .filter((expiresAt) => expiresAt > now)
    .sort((first, second) => first - second);

  return activeExpiryTimes[0] ?? null;
}

function formatRemainingTime(delayMs: number) {
  const totalSeconds = Math.ceil(delayMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (minutes === 0) {
    return `${seconds}s`;
  }

  return `${minutes}min ${seconds.toString().padStart(2, "0")}s`;
}

function reconcileDeck(
  profiles: UserType[],
  savedDeck: DeckState,
  now = Date.now(),
): DeckState {
  const profilesById = new Map(profiles.map((profile) => [profile.id, profile]));
  const activeRejected: RejectedProfiles = {};
  const expiredRejectedIds: number[] = [];

  Object.entries(savedDeck.rejectedUntil).forEach(([userId, expiresAt]) => {
    const id = Number(userId);

    if (!profilesById.has(id)) return;

    if (expiresAt > now) {
      activeRejected[userId] = expiresAt;
    } else {
      expiredRejectedIds.push(id);
    }
  });

  const activeRejectedIds = new Set(
    Object.keys(activeRejected).map((userId) => Number(userId)),
  );
  const expiredRejectedIdSet = new Set(expiredRejectedIds);

  const keptIds = savedDeck.orderedIds.filter((id) => {
    return (
      profilesById.has(id) &&
      !activeRejectedIds.has(id) &&
      !expiredRejectedIdSet.has(id)
    );
  });
  const keptIdSet = new Set(keptIds);

  const newIds = profiles
    .map((profile) => profile.id)
    .filter((id) => {
      return (
        !keptIdSet.has(id) &&
        !activeRejectedIds.has(id) &&
        !expiredRejectedIdSet.has(id)
      );
    });

  const orderedIds = uniqueIds([
    ...keptIds,
    ...newIds,
    ...expiredRejectedIds,
  ]);
  const currentId = orderedIds.includes(savedDeck.currentId ?? -1)
    ? savedDeck.currentId
    : orderedIds[0] ?? null;

  return {
    orderedIds,
    currentId,
    rejectedUntil: activeRejected,
  };
}

function removeFromDeck(deckState: DeckState, userId: number): DeckState {
  const orderedIds = deckState.orderedIds.filter((id) => id !== userId);

  return {
    ...deckState,
    orderedIds,
    currentId: orderedIds[0] ?? null,
  };
}

export default function Match() {
  const [invalide, setInvalide] = useState("");
  const [isMatch, setIsMatch] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [deckState, setDeckState] = useState<DeckState | null>(null);
  const [now, setNow] = useState(() => Date.now());

  const { data: profiles, isLoading, isError } = useOtherUser();
  const {
    data: currentUser,
    isLoading: isCurrentUserLoading,
    isError: isCurrentUserError,
  } = useUser();
  const currentUserId =
    typeof currentUser?.id === "number" ? currentUser.id : undefined;
  const queryClient = useQueryClient();

  useEffect(() => {
    const interval = window.setInterval(
      () => setNow(Date.now()),
      REJECT_CHECK_INTERVAL_MS,
    );

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!profiles || currentUserId === undefined) return;

    setDeckState((currentDeckState) => {
      const savedDeck = currentDeckState ?? readDeckState(currentUserId);
      const nextDeck = reconcileDeck(profiles, savedDeck, now);

      saveDeckState(currentUserId, nextDeck);
      return areDeckStatesEqual(currentDeckState, nextDeck)
        ? currentDeckState
        : nextDeck;
    });
  }, [currentUserId, now, profiles]);

  const profilesById = useMemo(() => {
    return new Map((profiles ?? []).map((profile) => [profile.id, profile]));
  }, [profiles]);

  const orderedProfiles = useMemo(() => {
    if (!deckState) return [];

    return deckState.orderedIds
      .map((id) => profilesById.get(id))
      .filter((profile): profile is UserType => profile !== undefined);
  }, [deckState, profilesById]);

  const currentProfile =
    deckState?.currentId !== null && deckState?.currentId !== undefined
      ? profilesById.get(deckState.currentId) ?? orderedProfiles[0]
      : orderedProfiles[0];
  const nextRejectedExpiry = getNextRejectedExpiry(deckState, now);
  const nextRefreshDelayMs =
    nextRejectedExpiry === null ? null : Math.max(0, nextRejectedExpiry - now);

  useEffect(() => {
    if (nextRejectedExpiry === null) return;

    const timeout = window.setTimeout(() => {
      setNow(Date.now());
      queryClient.invalidateQueries({ queryKey: ["otherUsers"] });
    }, Math.max(0, nextRejectedExpiry - Date.now()) + 50);

    return () => window.clearTimeout(timeout);
  }, [nextRejectedExpiry, queryClient]);

  const updateStoredDeck = (updater: (deckState: DeckState) => DeckState) => {
    if (!profiles || currentUserId === undefined) return;

    setDeckState((currentDeckState) => {
      const savedDeck = currentDeckState ?? readDeckState(currentUserId);
      const reconciledDeck = reconcileDeck(profiles, savedDeck);
      const nextDeck = updater(reconciledDeck);

      saveDeckState(currentUserId, nextDeck);
      return nextDeck;
    });
  };

  const rejected = async (userId: number) => {
    if (isActionLoading) return;

    setInvalide("");
    setIsActionLoading(true);

    try {
      await api.post("/match/validate", {
        userId,
        status: "reject",
      });

      updateStoredDeck((currentDeckState) => {
        const nextDeck = removeFromDeck(currentDeckState, userId);

        return {
          ...nextDeck,
          rejectedUntil: {
            ...nextDeck.rejectedUntil,
            [String(userId)]: Date.now() + REJECT_DURATION_MS,
          },
        };
      });
    } catch (error) {
      setInvalide(getErrorMessage(error, "Une erreur est survenue, réessayez."));
    } finally {
      setIsActionLoading(false);
    }
  };

  const like = async (userId: number) => {
    if (isActionLoading) return;

    setInvalide("");
    setIsActionLoading(true);

    try {
      const { data } = await api.post("/match/validate", {
        userId,
        status: "like",
      });

      queryClient.invalidateQueries({ queryKey: ["activity"] });
      queryClient.invalidateQueries({ queryKey: ["otherUsers"] });
      updateStoredDeck((currentDeckState) =>
        removeFromDeck(currentDeckState, userId),
      );

      if (data.match) {
        setIsMatch(true);
      }
    } catch (error) {
      setInvalide(getErrorMessage(error, "Une erreur est survenue, réessayez."));
    } finally {
      setIsActionLoading(false);
    }
  };

  if (isError || isCurrentUserError) {
    return <IfIsError>Erreur : impossible de charger les profils.</IfIsError>;
  }

  if (isLoading || isCurrentUserLoading || !profiles || !deckState) {
    return (
      <Bottom>
        <IfIsLoading>Chargement des profils...</IfIsLoading>
      </Bottom>
    );
  }

  if (orderedProfiles.length === 0 || !currentProfile) {
    return (
      <Bottom>
        <div className="max-w-6xl w-full mx-auto min-h-[75vh] flex flex-col justify-center items-center px-4 pb-16">
          <div className="bg-white rounded-3xl shadow-xl border border-gray-200/80 p-8 md:p-10 w-full max-w-md flex flex-col items-center text-center gap-5">
            <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center">
              <Heart className="w-8 h-8 text-rose-500" />
            </div>

            <div>
              <h1 className="text-2xl font-extrabold text-blue-950">
                Plus de profils pour l'instant
              </h1>
              <p className="text-gray-500 text-sm mt-2">
                {nextRefreshDelayMs === null
                  ? "Aucun profil disponible pour le moment."
                  : `Prochain profil dans ${formatRemainingTime(nextRefreshDelayMs)}.`}
              </p>
            </div>
          </div>
        </div>
        <Navigation />
      </Bottom>
    );
  }

  if (isMatch) {
    return (
      <Bottom>
        <div className="max-w-6xl w-full mx-auto my-auto min-h-[75vh] flex flex-col justify-center items-center px-4 pb-16">
          <div className="bg-white rounded-3xl shadow-xl border border-gray-200/80 p-8 md:p-12 w-full max-w-md flex flex-col items-center text-center gap-6">
            <h1 className="text-4xl font-extrabold text-rose-500">
              Vous avez un Match !
            </h1>
            <HeartPlus className="w-20 h-20 text-rose-500 animate-bounce" />
            <p className="text-gray-600">
              Vous pouvez maintenant discuter avec cette personne.
            </p>

            <button
              onClick={() => {
                setIsMatch(false);
                queryClient.invalidateQueries({ queryKey: ["matches"] });
                queryClient.invalidateQueries({ queryKey: ["activity"] });
              }}
              className="px-6 py-3 bg-blue-950 text-white rounded-full font-semibold hover:bg-blue-900 transition"
            >
              Continuer a defiler
            </button>
          </div>
        </div>
        <Navigation />
      </Bottom>
    );
  }

  return (
    <>
      <ProfileCard photo={currentProfile.photo}>
        <div className="w-full flex flex-col items-center pb-14">
          <MatchProfile user={currentProfile} />

          {invalide && (
            <p className="text-red-500 text-sm mt-3 font-medium">{invalide}</p>
          )}
        </div>
      </ProfileCard>

      <div className="fixed bottom-20 md:bottom-22 left-1/2 -translate-x-1/2 w-full max-w-xs md:max-w-sm flex justify-between px-4 z-40 pointer-events-none">
        <button
          type="button"
          disabled={isActionLoading}
          onClick={() => rejected(currentProfile.id)}
          style={{ backgroundColor: "#f97316", color: "#ffffff" }}
          className="flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-full shadow-2xl active:scale-90 hover:scale-105 transition-all cursor-pointer pointer-events-auto border-4 border-white disabled:opacity-50 disabled:cursor-not-allowed"
          title="Refuser"
          aria-label="Refuser"
        >
          <X className="w-7 h-7 md:w-8 md:h-8 stroke-[2.5]" />
        </button>

        <button
          type="button"
          disabled={isActionLoading}
          onClick={() => like(currentProfile.id)}
          style={{ backgroundColor: "#f43f5e", color: "#ffffff" }}
          className="flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-full shadow-2xl active:scale-90 hover:scale-105 transition-all cursor-pointer pointer-events-auto border-4 border-white disabled:opacity-50 disabled:cursor-not-allowed"
          title="Liker"
          aria-label="Liker"
        >
          <Heart className="w-7 h-7 md:w-8 md:h-8 fill-white text-white" />
        </button>
      </div>
    </>
  );
}
