'use client'

import { useRouter } from "next/navigation";
import { otherUser, useUser } from "@/src/hook/useUser";
import EditProfile from "@/src/composant/profile/editProfile";
import IfIsError from "@/src/composant/profile/ifIsError";
import IfIsLoading from "@/src/composant/profile/ifIsLoaging";
import MatchProfile from "@/src/composant/profile/matchProfile";

export default function Match()
{
  const router = useRouter();

	//hook pour les donne(attendre que les donner soit la)
  const { data: userMatch, isLoading, isError } = otherUser();

  // État de chargement grand format
  if (isLoading) {
    return (
      <IfIsLoading/>
    );
  }

  // État d'erreur grand format
  if (isError || !userMatch) {
    return (
      <IfIsError/>
    );
  }

  return (
		<EditProfile>
      <MatchProfile user={userMatch}/>
			<button
        type="button"
        className="fixed bottom-6 right-6 z-50 flex items-center justify-center bg-lime-500 hover:bg-lime-600 text-white p-3 rounded-full shadow-xl transition-transform active:scale-95 cursor-pointer"
			>
      </button>
		</EditProfile>
  );
}