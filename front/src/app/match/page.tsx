"use client";

import { useOtherUser } from "@/src/hook/useUser";
import ProfileCard from "@/src/composant/profile/ProfileCard";
import IfIsError from "@/src/constant/ifIsError";
import IfIsLoading from "@/src/constant/ifIsLoaging";
import MatchProfile from "@/src/composant/match/matchProfile";
import { Heart, X, HeartPlus, RotateCcw } from "lucide-react";
import { api } from "@/src/lib/axios";
import { useEffect, useMemo, useState } from "react";
import { useMatch } from "@/src/composant/match/matchStore";
import Bottom from "@/src/display/bottom";
import Navigation from "@/src/display/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { getErrorMessage } from "@/src/lib/errors";

const REJECT_STORAGE_KEY = "temporarilyRejectedProfiles";
const REJECT_DURATION_MS = 5 * 1000;

type RejectedProfiles = Record<string, number>;

function getRejectedIds() {
  if (typeof window === "undefined") return [];

  const now = Date.now();

  try {
    const saved = localStorage.getItem(REJECT_STORAGE_KEY);
    const rejected: RejectedProfiles = saved ? JSON.parse(saved) : {};
    const activeRejected: RejectedProfiles = {};

    Object.entries(rejected).forEach(([userId, expiresAt]) => {
      if (expiresAt > now) {
        activeRejected[userId] = expiresAt;
      }
    });

    localStorage.setItem(REJECT_STORAGE_KEY, JSON.stringify(activeRejected));
    return Object.keys(activeRejected).map(Number);
  } catch {
    localStorage.removeItem(REJECT_STORAGE_KEY);
    return [];
  }
}

function rejectTemporarily(userId: number) {
  if (typeof window === "undefined") return;

  const rejectedIds = getRejectedIds();
  const rejected: RejectedProfiles = {};

  rejectedIds.forEach((id) => {
    rejected[String(id)] = Date.now() + REJECT_DURATION_MS;
  });

  rejected[String(userId)] = Date.now() + REJECT_DURATION_MS;
  localStorage.setItem(REJECT_STORAGE_KEY, JSON.stringify(rejected));
}

export default function Match() {
  const [invalide, setInvalide] = useState("");
  const [isMatch, setIsMatch] = useState(false);
  const [rejectedIds, setRejectedIds] = useState<number[]>([]);

  const { data: profiles, isLoading, isError } = useOtherUser();
  const index = useMatch((state) => state.currentIndex);
  const nextProfile = useMatch((state) => state.nextProfile);
  const reset = useMatch((state) => state.resetProfiles);
  const queryClient = useQueryClient();

  useEffect(() => {
    const refreshRejectedIds = () => {
      setRejectedIds(getRejectedIds());
    };

    refreshRejectedIds();
    const interval = window.setInterval(refreshRejectedIds, 1000);

    return () => window.clearInterval(interval);
  }, []);

  const visibleProfiles = useMemo(() => {
    return (profiles ?? []).filter((profile) => !rejectedIds.includes(profile.id));
  }, [profiles, rejectedIds]);

  useEffect(() => {
    if (visibleProfiles.length > 0 && index >= visibleProfiles.length) {
      reset();
    }
  }, [visibleProfiles.length, index, reset]);

  const handleNext = async () => {
    if (index + 1 >= visibleProfiles.length) {
      await queryClient.invalidateQueries({ queryKey: ["otherUsers"] });
      reset();
    } else {
      nextProfile();
    }
  };

  const rejected = async (userId: number) => {
    setInvalide("");

    try {
      await api.post("/match/validate", {
        userId,
        status: "reject",
      });

      rejectTemporarily(userId);
      setRejectedIds(getRejectedIds());
      await handleNext();
    } catch (error) {
      setInvalide(getErrorMessage(error, "Une erreur est survenue, réessayez."));
    }
  };

  const like = async (userId: number) => {
    setInvalide("");

    try {
      const { data } = await api.post("/match/validate", {
        userId,
        status: "like",
      });

      queryClient.invalidateQueries({ queryKey: ["activity"] });

      if (data.match) {
        setIsMatch(true);
      } else {
        await handleNext();
      }
    } catch (error) {
      setInvalide(getErrorMessage(error, "Une erreur est survenue, réessayez."));
    }
  };

  if (isLoading) {
    return (
      <Bottom>
        <IfIsLoading>Chargement des profils...</IfIsLoading>
      </Bottom>
    );
  }

  if (isError || !profiles) {
    return <IfIsError>Erreur : impossible de charger les profils.</IfIsError>;
  }

  if (visibleProfiles.length === 0) {
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
                Les profils que tu as passés reviendront plus tard. Reviens dans quelques minutes ou relance une recherche.
              </p>
            </div>
          </div>
        </div>
        <Navigation />
      </Bottom>
    );
  }

  const currentProfile = visibleProfiles[index] ?? visibleProfiles[0];

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
              onClick={async () => {
                setIsMatch(false);
                queryClient.invalidateQueries({ queryKey: ["matches"] });
                queryClient.invalidateQueries({ queryKey: ["activity"] });
                await handleNext();
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
          onClick={() => rejected(currentProfile.id)}
          style={{ backgroundColor: "#f97316", color: "#ffffff" }}
          className="flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-full shadow-2xl active:scale-90 hover:scale-105 transition-all cursor-pointer pointer-events-auto border-4 border-white"
          title="Refuser"
          aria-label="Refuser"
        >
          <X className="w-7 h-7 md:w-8 md:h-8 stroke-[2.5]" />
        </button>

        <button
          type="button"
          onClick={() => like(currentProfile.id)}
          style={{ backgroundColor: "#f43f5e", color: "#ffffff" }}
          className="flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-full shadow-2xl active:scale-90 hover:scale-105 transition-all cursor-pointer pointer-events-auto border-4 border-white"
          title="Liker"
          aria-label="Liker"
        >
          <Heart className="w-7 h-7 md:w-8 md:h-8 fill-white text-white" />
        </button>
      </div>
    </>
  );
}