'use client'
import Menu from "@/src/composant/profile/menu";
import ProfileCard from "@/src/composant/profile/ProfileCard";
import IfIsLoading from "@/src/composant/profile/ifIsLoaging";
import IfIsError from "@/src/composant/profile/ifIsError";
import { useUser } from "@/src/hook/useUser";
import { getKindLabel, getOrientationLabel } from "@/src/constant/user";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

export default function Profile() {
  const router = useRouter();
  const { data: user, isLoading, isError } = useUser();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (user && (!user.username || !user.birthday || !user.kind || !user.orientation)) {
      queryClient.invalidateQueries({ queryKey: ['userMe'] }).then(() => {
        router.push("/createProfile");
      });
    }
  }, [user, queryClient, router]);

  // État de chargement grand format
  if (isLoading) {
    return(
			<IfIsLoading/>
		);
  }

  // État d'erreur grand format
  if (isError || !user) {
    return (
      <IfIsError/>
    );
  }

  if (!user.username || !user.birthday || !user.kind || !user.orientation)
  {
    <IfIsLoading/>
  }

  return (
			<ProfileCard>
					<Menu/>
          {/* Nom & Email */}
          <h1 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tight">
            {user.username}
          </h1>
          <p className="text-base md:text-xl font-medium text-gray-500 mt-2">
            {user.email}
          </p>

          {/* Badges de genre et orientation */}
					{(user.kind || user.orientation) && (
						<div className="flex gap-3 mt-6 flex-wrap justify-center">
      		  {user.kind && (
							<span className="bg-blue-50 text-blue-950 text-sm md:text-base font-bold px-5 py-2 rounded-full border border-blue-100 shadow-sm">
      		      {getKindLabel(user.kind)}
      		    </span>
      		  )}
      		  {user.orientation && (
							<span className="bg-purple-50 text-purple-900 text-sm md:text-base font-bold px-5 py-2 rounded-full border border-purple-100 shadow-sm">
      		      {getOrientationLabel(user.orientation)}
      		    </span>
      		  )}
      		</div>
          //   </div>
				)}

          {/* Zone de biographie */}
          <div className="w-full max-w-2xl mt-10 pt-8 border-t border-gray-100 text-left">
            <span className="text-xs md:text-sm font-extrabold text-gray-400 uppercase tracking-widest block mb-3">
              À propos de moi
            </span>
            <div className="bg-gray-50/80 p-6 rounded-2xl border border-gray-100">
              <p className="text-gray-800 text-base md:text-lg leading-relaxed">
                {user.biography || "Aucune biographie pour le moment."}
              </p>
            </div>
          </div>
			</ProfileCard>
  );
}