"use client";

// import { useRouter } from "next/navigation";
import { useOtherUser } from "@/src/hook/useUser";
import ProfileCard from "@/src/composant/profile/ProfileCard";
import IfIsError from "@/src/constant/ifIsError";
import IfIsLoading from "@/src/constant/ifIsLoaging";
import MatchProfile from "@/src/composant/match/matchProfile";
import { Heart, X, RotateCcw } from "lucide-react";
import { api } from "@/src/lib/axios";
import { useState } from "react";
import { useMatch } from "@/src/composant/match/matchStore";

export default function Match() {
  // const router = useRouter();
  const [invalide, setInvalide] = useState("");

  const { data: profiles, isLoading, isError, refetch } = useOtherUser();
  const index = useMatch((state) => state.currentIndex);
  const nextProfile = useMatch((state) => state.nextProfile);

  const reset = useMatch((state) => state.resetProfiles);

  // 3. Gestion des états de chargement et d'erreur
  if (isLoading) {
    return <IfIsLoading>Chargement du profil...</IfIsLoading>;
  }
  if (isError || !profiles) {
    return <IfIsError> Erreur : impossible de charger le profil. </IfIsError>;
  }
  // 4. Le profil actuel
  const currentProfile = profiles[index];

  const rejected = async (userId: number) => {
    setInvalide("");
    try {
      const res = await api.post("/match/validete", {
        userId: userId,
        status: "reject",
      });
      // nextProfile();
      await handleNext();
    } catch {
      setInvalide("Une erreur est survenue, veuillez réessayer.");
    }
  };

  const like = async (userId: number) => {
    setInvalide("");
    try {
      const res = await api.post("/match/validete", {
        userId: userId,
        status: "like",
      });
      // nextProfile();
      await handleNext();
    } catch {
      setInvalide("Une erreur est survenue, veuillez réessayer.");
    }
  };

  const handleNext = async () => {
    // S'il ne reste plus de profil après celui-ci (c'était le dernier)
    if (index + 2 >= profiles.length) {
      reset(); // 1. Remet l'index à 0
      await refetch(); // 2. Recharge automatiquement de nouveaux profils !
    } else {
      nextProfile(); // Sinon, passe simplement au profil suivant
    }
  };

  // const handleReload = async () => {
  //   reset();
  //   setInvalide("");
  //   await refetch();
  // };

  // // Si tous les profils de la file ont été traités
  // if (!currentProfile) {
  //   return (
  //     <ProfileCard>
  //       <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
  //         <h2 className="text-2xl md:text-3xl font-extrabold text-gray-800 mb-3">
  //           Plus aucun profil disponible
  //         </h2>
  //         <p className="text-gray-500 max-w-md mb-8">
  //           Vous avez vu tous les profils de cette session. Revenez plus tard ou rechargez pour revoir de nouveaux profils !
  //         </p>
  //         <button
  //           type="button"
  //           onClick={handleReload}
  //           className="flex items-center gap-2 px-6 py-3 bg-blue-950 text-white font-semibold rounded-full shadow-lg hover:bg-blue-900 active:scale-95 transition-all cursor-pointer"
  //         >
  //           <RotateCcw className="w-5 h-5" />
  //           <span>Recharger les profils</span>
  //         </button>
  //       </div>
  //     </ProfileCard>
  //   );
  // }

  return (
    <>
      <ProfileCard>
        <div className="w-full flex flex-col items-center pb-14">
          {/* Indicateur de progression */}
          {/* <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Profil {index + 1} sur {profiles.length}
          </div> */}

          <MatchProfile user={currentProfile} />

          {invalide && (
            <p className="text-red-500 text-sm mt-3 font-medium">{invalide}</p>
          )}
        </div>
      </ProfileCard>

      {/* Boutons d'action flottants (100% fixes en bas de l'écran, au-dessus de la navbar) */}
      <div className="fixed bottom-20 md:bottom-22 left-1/2 -translate-x-1/2 w-full max-w-xs md:max-w-sm flex justify-between px-4 z-40 pointer-events-none">
        {/* Bouton Refuser (Orange / Croix) */}
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

        {/* Bouton Like (Rose / Cœur) */}
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
