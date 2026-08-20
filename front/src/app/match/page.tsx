"use client";

import { useRouter } from "next/navigation";
import { otherUser, useUser } from "@/src/hook/useUser";
import ProfileCard from "@/src/composant/profile/ProfileCard";
import IfIsError from "@/src/composant/profile/ifIsError";
import IfIsLoading from "@/src/composant/profile/ifIsLoaging";
import MatchProfile from "@/src/composant/profile/matchProfile";
import { Heart, X } from "lucide-react";
import { api } from "@/src/lib/axios";
import { useState } from "react";

export default function Match() {
  const router = useRouter();
  const [invalide, setInvalide] = useState("");

  //hook pour les donne(attendre que les donner soit la)
  const { data: userMatch, isLoading, isError } = otherUser();

  // État de chargement grand format
  if (isLoading) {
    return <IfIsLoading />;
  }

  // État d'erreur grand format
  if (isError || !userMatch) {
    return <IfIsError />;
  }

  const rejected = async (userId: number) => {
    setInvalide("");
    try {
      const res = await api.post("/match/validete", {
        userId: userId,
        status: "reject",
      });
      localStorage.setItem("token", res.data.access_token);
      // router.push("/myProfile");// mettre un nouveau profile
    } catch {
      setInvalide("Reesayer");
    }
  };

  const like = async (userId: number) => {
    setInvalide("");
    try {
      const res = await api.post("/match/validete", {
        userId: userId,
        status: "like",
      });
      localStorage.setItem("token", res.data.access_token);
      // router.push("/createProfi");// mettre un nouveau profile
    } catch {
      setInvalide("Reesayer");
    }
  };

  return (
    <ProfileCard>
      <MatchProfile user={userMatch} />
      <div className="w-full flex justify-between mt-6 px-4">
        {/* Bouton de gauche (Orange / Refuser) */}
        <button
          type="button"
          onClick={() => rejected(userMatch.id)}
          style={{ backgroundColor: "#f97316", color: "#ffffff" }}
          className="flex items-center justify-center w-12 h-12 rounded-full shadow-xl active:scale-95 cursor-pointer hover:opacity-90 transition-all"
        >
          <X className="w-6 h-6 stroke-[2.5]" />
        </button>

        {/* Bouton de droite (Rose / Like) */}
        <button
          type="button"
          onClick={() => like(userMatch.id)}
          style={{ backgroundColor: "#f43f5e", color: "#ffffff" }}
          className="flex items-center justify-center w-12 h-12 rounded-full shadow-xl active:scale-95 cursor-pointer hover:opacity-90 transition-all"
        >
          <Heart className="w-6 h-6 fill-white text-white" />
        </button>
      </div>
    </ProfileCard>
  );
}
