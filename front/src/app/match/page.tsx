"use client";

import { useOtherUser } from "@/src/hook/useUser";
import type { UserType } from "@/src/type/user";
import ProfileCard from "@/src/composant/profile/ProfileCard";
import IfIsError from "@/src/constant/ifIsError";
import IfIsLoading from "@/src/constant/ifIsLoaging";
import MatchProfile from "@/src/composant/match/matchProfile";
import { Heart, X, HeartPlus } from "lucide-react";
import { api } from "@/src/lib/axios";
import { useEffect, useState } from "react";
import Bottom from "@/src/display/bottom";
import Navigation from "@/src/display/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { getErrorMessage } from "@/src/lib/errors";
import { useMatch } from "@/src/composant/match/matchStore";

const REJECT_STORAGE_KEY = "temporarilyRejectedProfiles";
// const MATCH_DECK_STORAGE_KEY = "matchDeckOrder";
const REJECT_DURATION_MS = 5 * 1000;
const REJECT_CHECK_INTERVAL_MS = 1000;

type RejectedProfiles = Record<string, number>;

function getRejectedProfiles(): RejectedProfiles {
  if (typeof window === "undefined") return {};

  try {
    const saved = localStorage.getItem(REJECT_STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch {
    localStorage.removeItem(REJECT_STORAGE_KEY);
    return {};
  }
}

function saveRejectedProfiles(rejectedProfiles: RejectedProfiles) {
  if (typeof window === "undefined") return;
  localStorage.setItem(REJECT_STORAGE_KEY, JSON.stringify(rejectedProfiles));
}

// function getSavedDeckOrder(): number[] {
//   if (typeof window === "undefined") return [];

//   try {
//     const saved = localStorage.getItem(MATCH_DECK_STORAGE_KEY);
//     return saved ? JSON.parse(saved) : [];
//   } catch {
//     localStorage.removeItem(MATCH_DECK_STORAGE_KEY);
//     return [];
//   }
// }

function saveDeckOrder(deck: UserType[]) {
  if (typeof window === "undefined") return;

  const ids = deck.map((profile) => profile.id);
  // localStorage.setItem(MATCH_DECK_STORAGE_KEY, JSON.stringify(ids));
}

function rejectTemporarily(userId: number) {
  const rejectedProfiles = getRejectedProfiles();

  rejectedProfiles[String(userId)] = Date.now() + REJECT_DURATION_MS;

  saveRejectedProfiles(rejectedProfiles);
}

function isRejectActive(rejectedProfiles: RejectedProfiles, userId: number) {
  const expiresAt = rejectedProfiles[String(userId)];
  return expiresAt !== undefined && expiresAt > Date.now();
}

function isRejectExpired(rejectedProfiles: RejectedProfiles, userId: number) {
  const expiresAt = rejectedProfiles[String(userId)];
  return expiresAt !== undefined && expiresAt <= Date.now();
}

export default function Match() {
  const [invalide, setInvalide] = useState("");
  const [isMatch, setIsMatch] = useState(false);
  const deck = useMatch((state) => state.deck);
  const setDeck = useMatch((state) => state.setDeck);
  const [rejectedProfiles, setRejectedProfiles] = useState<RejectedProfiles>({});
  const [hasBuiltDeck, setHasBuiltDeck] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const { data: profiles, isLoading, isError } = useOtherUser();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!hasBuiltDeck) return;
    saveDeckOrder(deck);
  }, [deck, hasBuiltDeck]);

  useEffect(() => {
    const refreshRejectedProfiles = () => {
      setRejectedProfiles(getRejectedProfiles());
    };

    refreshRejectedProfiles();

    const interval = window.setInterval(refreshRejectedProfiles, REJECT_CHECK_INTERVAL_MS);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!profiles) return;

    // setDeck((currentDeck) => {
      const profilesById = new Map(
        profiles.map((profile) => [profile.id, profile])
      );
    
      // const savedDeck = currentDeck.length > 0
        // ? currentDeck
        // : getSavedDeckOrder()
            // .map((id) => profilesById.get(id))
            // .filter((profile): profile is UserType => profile !== undefined);
    
      // const keptDeck = savedDeck
        // .filter((profile) => profilesById.has(profile.id))
        // .filter((profile) => !isRejectActive(rejectedProfiles, profile.id))
        // .map((profile) => profilesById.get(profile.id)!);
    
      // const keptIds = new Set(keptDeck.map((profile) => profile.id));
    
      // const newProfiles = profiles.filter((profile) => {
        // const wasAlreadyInDeck = keptIds.has(profile.id);
        // const wasRejected = rejectedProfiles[String(profile.id)] !== undefined;
      
        // return !wasAlreadyInDeck && !wasRejected;
      });
    
      // const expiredRejectedProfiles = profiles.filter((profile) => {
        // const wasAlreadyInDeck = keptIds.has(profile.id);
      
        // return (
          // !wasAlreadyInDeck &&
        //   isRejectExpired(rejectedProfiles, profile.id)
        // );
      // });
    
      // return [
      //   ...keptDeck,
      //   ...newProfiles,
      //   ...expiredRejectedProfiles,
      // ];
    // });

    setHasBuiltDeck(true);
  // }, [profiles, rejectedProfiles]);

  const rejected = async (userId: number) => {
    if (isActionLoading) return;

    setInvalide("");
    setIsActionLoading(true);

    try {
      await api.post("/match/validate", {
        userId,
        status: "reject",
      });

      rejectTemporarily(userId);
      setRejectedProfiles(getRejectedProfiles());

      setDeck((currentDeck) =>
        currentDeck.filter((profile) => profile.id !== userId)
      );
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

      setDeck((currentDeck) =>
        currentDeck.filter((profile) => profile.id !== userId)
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

  if (isLoading || !hasBuiltDeck) {
    return (
      <Bottom>
        <IfIsLoading>Chargement des profils...</IfIsLoading>
      </Bottom>
    );
  }

  if (isError || !profiles) {
    return <IfIsError>Erreur : impossible de charger les profils.</IfIsError>;
  }

  if (deck.length === 0) {
    return (
      <Bottom>
        <div className="max-w-6xl w-full mx-auto min-h-[75vh] flex flex-col justify-center items-center px-4 pb-16">
          <div className="bg-white rounded-3xl shadow-xl border border-gray-200/80 p-8 md:p-10 w-full max-w-md flex flex-col items-center text-center gap-5">
            <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center">
              <Heart className="w-8 h-8 text-rose-500" />
            </div>

            <div>
              <h1 className="text-2xl font-extrabold text-blue-950">
                Plus de profils pour l’instant
              </h1>
              <p className="text-gray-500 text-sm mt-2">
                Les profils que tu as passés reviendront plus tard. Reviens dans quelques minutes.
              </p>
            </div>
          </div>
        </div>
        <Navigation />
      </Bottom>
    );
  }

  const currentProfile = deck[0];

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
              Continuer à défiler
            </button>
          </div>
        </div>
        <Navigation />
      </Bottom>
    );
  }

  return (
    <>
      <ProfileCard photo={currentProfile?.photo}>
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
          className="flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-full shadow-2xl active:scale-90 hover:scale-105 transition-all cursor-pointer pointer-events-auto border-4 border-white disabled:opacity-50"
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
          className="flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-full shadow-2xl active:scale-90 hover:scale-105 transition-all cursor-pointer pointer-events-auto border-4 border-white disabled:opacity-50"
          title="Liker"
          aria-label="Liker"
        >
          <Heart className="w-7 h-7 md:w-8 md:h-8 fill-white text-white" />
        </button>
      </div>
    </>
  );
}