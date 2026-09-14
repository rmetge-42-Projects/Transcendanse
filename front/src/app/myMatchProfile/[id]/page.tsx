"use client"
import ProfileCard from "@/src/composant/profile/ProfileCard";
import { UserType } from "@/src/type/user";
import MatchProfile from "@/src/composant/match/matchProfile";
import { useMyMatch } from "@/src/hook/useUser";
import IfIsError from "@/src/constant/ifIsError";
import IfIsLoading from "@/src/constant/ifIsLoaging";
import Bottom from "@/src/display/bottom";

import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";


export default function MyMatchProfile()
{
    const params = useParams();
    const userId = Number(params.id);
    const router = useRouter();

    const { data: user, isLoading, isError } = useMyMatch(userId);

    if (isLoading) {
        return (
          <Bottom>
            <IfIsLoading>Chargement du profil...</IfIsLoading>
          </Bottom>);
      }
      if (isError || !user) {
        return <IfIsError> Erreur : impossible de charger le profil. </IfIsError>;
      }

    return (
        <ProfileCard> 
          <MatchProfile user={user}/>
          <div className="max-w-4xl mx-auto px-6 py-6">
            <Link 
              href="/message" 
              className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-sm border border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition"
            >
              <ArrowLeft />
            </Link>
          </div>
          {/* <button
            onClick={() => router.back()}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
          >
            <ArrowLeft />
            Retour
          </button> */}
          {/* <MatchProfile user={user}/> */}
        </ProfileCard>
    );
}