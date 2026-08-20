'use client'

import Bottom from "@/src/display/bottom";
import Footer from "@/src/display/footer";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { useUser } from "@/src/hook/useUser";
import { Settings, UserPen, Lock } from 'lucide-react';
import Navigation from "@/src/display/navigation";

export default function Profile() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

	//hook pour les donne(attendre que les donner soit la)
  const { data: user, isLoading, isError } = useUser();

  function menu() {
    setIsOpen(!isOpen);
  }

  function logout() {
    const confirmLogout = window.confirm("Es-tu sûr de vouloir te déconnecter ?");
    if (confirmLogout) {
      localStorage.removeItem('token');
      router.push('/');
    }
  }

  // État de chargement grand format
  if (isLoading) {
    return (
      <Bottom>
        <div className="flex flex-col items-center justify-center min-h-[70vh]">
          <div className="w-14 h-14 border-4 border-blue-950 border-t-transparent rounded-full animate-spin" />
          <p className="mt-6 text-gray-600 font-medium text-lg">Chargement de ton profil...</p>
        </div>
        <Footer />
      </Bottom>
    );
  }

  // État d'erreur grand format
  if (isError || !user) {
    return (
      <Bottom>
        <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-6">
          <p className="text-red-500 font-bold text-2xl">
            Erreur : impossible de charger le profil.
          </p>
          <p className="text-gray-500 text-base mt-2">
            Vérifie ta connexion ou réessaye de te connecter.
          </p>
        </div>
        <Footer />
      </Bottom>
    );
  }

  return (
    <Bottom>
      {/* Conteneur large pour écran Web */}
      <div className="relative max-w-4xl mx-auto min-h-[75vh] flex flex-col justify-between px-6 py-10">
        
        {/* Menu paramètres en haut à droite */}
        <div className="absolute top-4 right-6 z-50">
					<button 
					  onClick={menu}
					  className="p-3 rounded-2xl bg-white border border-gray-200 shadow-sm hover:bg-gray-50 transition-all cursor-pointer text-gray-700 flex items-center justify-center"
					  aria-label="Settings"
					>
					  <Settings />
          </button>

          {isOpen && (
						<div className="absolute right-0 mt-3 w-56 bg-white border border-gray-200 rounded-2xl shadow-2xl z-50 p-2 flex flex-col gap-1 text-base">
              <Link 
                href="/modifyProfile"
                className="px-4 py-3 rounded-xl hover:bg-gray-100 font-semibold text-gray-800 transition-colors flex items-center gap-3"
              >
								<UserPen/>
								 Modifier le profil
              </Link>
							<Link 
								href="/privacy"
								className="px-4 py-3 rounded-xl hover:bg-gray-100 font-semibold text-gray-800 transition-colors flex items-center gap-3"
              >
								<Lock/>
								Politique de confidentialité
							</Link>

              <button
                onClick={logout}
                className="w-full text-left px-4 py-3 rounded-xl hover:bg-red-50 font-semibold text-red-600 transition-colors cursor-pointer flex items-center gap-3"
              >
              	Se déconnecter
              </button>
            </div>
          )}
        </div>

        {/* Carte de profil principale */}
        <div className="flex flex-col items-center mt-20 bg-white border border-gray-200/80 rounded-3xl shadow-xl p-8 md:p-14 w-full text-center">
          
          {/* Avatar géant blanc sur fond sombre centré en haut */}
          <div className="w-36 h-36 md:w-44 md:h-44 rounded-full bg-blue-950 flex items-center justify-center shadow-2xl mb-6 border-8 border-white -mt-24 md:-mt-28">
            <svg 
              className="w-20 h-20 md:w-24 md:h-24 text-white" 
              fill="currentColor" 
              viewBox="0 0 24 24"
            >
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </div>

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
                <span className="bg-blue-50 text-blue-950 text-sm md:text-base font-bold px-5 py-2 rounded-full border border-blue-100 capitalize shadow-sm">
                  {user.kind}
                </span>
              )}
              {user.orientation && (
                <span className="bg-purple-50 text-purple-900 text-sm md:text-base font-bold px-5 py-2 rounded-full border border-purple-100 capitalize shadow-sm">
                  {user.orientation}
                </span>
              )}
            </div>
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

        </div>
      </div>
			<Navigation/>
    </Bottom>
  );
}