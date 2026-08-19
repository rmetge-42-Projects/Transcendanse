import Bottom from "../../display/bottom";
import Navigation from "../../display/navigation";
import { User } from "lucide-react";

export default function ProfileCard({children} : { children:React.ReactNode}){
    return (
      <Bottom>
      {/* Conteneur large pour écran Web */}
      <div className="relative max-w-4xl mx-auto min-h-[75vh] flex flex-col justify-between px-6 py-10">
        
        {/* Menu paramètres en haut à droite */}
        {/* Carte de profil principale */}
        <div className="flex flex-col items-center mt-20 bg-white border border-gray-200/80 rounded-3xl shadow-xl p-8 md:p-14 w-full text-center">
          
          {/* Avatar géant blanc sur fond sombre centré en haut */}
          <div className="w-36 h-36 md:w-44 md:h-44 rounded-full bg-blue-950 flex items-center justify-center shadow-2xl mb-6 border-8 border-white -mt-24 md:-mt-28">
						<User className="w-30 h-30 text-white"/>
          </div>

          {children}

        </div>
      </div>
			<Navigation/>
    </Bottom>
  );
}