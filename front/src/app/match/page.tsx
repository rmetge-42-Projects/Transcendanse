"use client";

// import { useRouter } from "next/navigation";
import { useOtherUser } from "@/src/hook/useUser";
import ProfileCard from "@/src/composant/profile/ProfileCard";
import IfIsError from "@/src/constant/ifIsError";
import IfIsLoading from "@/src/constant/ifIsLoaging";
import MatchProfile from "@/src/composant/match/matchProfile";
import { Heart, X, HeartPlus } from "lucide-react";
import { api } from "@/src/lib/axios";
import { useState } from "react";
import { useMatch } from "@/src/composant/match/matchStore";
import Bottom from "@/src/display/bottom";
import Navigation from "@/src/display/navigation";

export default function Match() {
  // const router = useRouter();
  const [invalide, setInvalide] = useState("");
  const [isMatch, setIsMatch] = useState(false);
  const { data: profiles, isLoading, isError, refetch } = useOtherUser();
  const index = useMatch((state) => state.currentIndex);
  const nextProfile = useMatch((state) => state.nextProfile);

  const reset = useMatch((state) => state.resetProfiles);

  // 3. Gestion des états de chargement et d'erreur
  if (isLoading) {
    return (
      <Bottom>
        <IfIsLoading>Chargement du profil...</IfIsLoading>
      </Bottom>);
  }
  if (isError || !profiles) {
    return <IfIsError> Erreur : impossible de charger le profil. </IfIsError>;
  }

  if (profiles.length === 0) {
    return (
      <Bottom>
        <div>Aucun profil disponible pour le moment.</div>
        <Navigation />
      </Bottom>);
  }

  // 4. Le profil actuel
  const currentProfile = profiles[index];

  //essayer de faire un truc si aucun profil n'est proposer/disponible du genre
  // un if (profiles.length === 0) 

  const rejected = async (userId: number) => {
    setInvalide("");
    try {
      const res = await api.post("/match/validate", {
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
    // setIsMatch(false);
    try {
      const {data} = await api.post("/match/validate", {
        userId: userId,
        status: "like",
      });
      // nextProfile();
      if (data.match){
        setIsMatch(true);
        // return (
        //    <div className="relative max-w-4xl mx-auto min-h-[75vh] flex flex-col justify-between px-6 py-10">
        //       vous avez un Match
        //       <HeartPlus/>

        //    </div>
        // )
      }
        
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

  if (isMatch) {
    return (
      <Bottom>
        <div className="max-w-6xl w-full mx-auto my-auto min-h-[75vh] flex flex-col justify-center items-center px-4 pb-16">
        
        {/* Rectangle blanc (Carte Match) */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-200/80 p-8 md:p-12 w-full max-w-md flex flex-col items-center text-center gap-6">        
            <h1 className="text-4xl font-extrabold text-rose-500">
              Vous avez un Match !
            </h1>
            <HeartPlus className="w-20 h-20 text-rose-500 animate-bounce" />
            <p className="text-gray-600">
              Vous pouvez maintenant discuter avec cette personne.
            </p>

            <button 
              onClick={() => setIsMatch(false)}
              className="px-6 py-3 bg-blue-950 text-white rounded-full font-semibold hover:bg-blue-900 transition"
              >
              Continuer à défiler
            </button>
          </div>
        </div>
        <Navigation/>
      </Bottom>
    );
  }
  
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
