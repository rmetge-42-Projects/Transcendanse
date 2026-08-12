// 'use client'
// import Bottom from "@/src/component/display/bottom"
// import { useRouter } from "next/navigation";
// import Footer from "@/src/component/footer";
// import { useState } from "react";
// import Modify from "../modifyProfile/page";
// import Link from "next/link";




// export default function Profile(){
//     const router = useRouter();
//     const [isOpen, setIsOpen] = useState(false);
//     function menu() {
//         setIsOpen(!isOpen);
//     }
//     function logout() {
//       // 1. Demander une confirmation à l'utilisateur
//       const confirmLogout = window.confirm("Es-tu sûr de vouloir te déconnecter ?");
        
//       if (confirmLogout) {
//         // 2. Supprimer le token du localStorage
//         localStorage.removeItem('token');
    
//         // 3. Rediriger vers la page d'accueil
//         router.push('/');
//       }
//     }
//     return(
//         <Bottom>
//             {/* Conteneur principal du menu */}
//             <div style={{ position: 'absolute', top: '16px', right:'16px', zIndex: 50 }}>
                
//                 {/* 2. Bouton  */}
//                 <button onClick={menu}>
//                     ⚙️ {isOpen ? '▲' : '▼'}
//                 </button>

//                 {/* 3. Le volet déroulant  */}
//                 {isOpen && (
//                     <div className="absolute right-0 mt-2 bg-white border border-gray-300 rounded-md p-2 shadow-md z-10 flex flex-col gap-2">
//                         <button
//                             onClick={logout}
//                             className="font-medium cursor-pointer text-red-500 text-left bg-transparent border-none p-0"
//                         >
//                         Logout
//                         </button>
//                         <Link href="/modifyProfile"
//                             className="font-medium cursor-pointer text-black text-left bg-transparent border-none p-0"
//                         >
//                         Modify
//                         </Link>
//                     </div>
//                 )}

//             </div>

//             <h1 
//                 className="text-2xl font-bold w-full flex justify-center pt-6"
//             >
//             your name
//             </h1>
//             <p>
//                 bio
//             </p>

//             <Footer/>
//         </Bottom>
//     );
// }

'use client'

import Bottom from "@/src/display/bottom";
import Footer from "@/src/display/footer";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
// import { useQuery } from '@tanstack/react-query';
// import { api } from "@/src/lib/axios";
import { useUser } from "@/src/hook/useUser";

export default function Profile() {
  // 1. TOUS les hooks déclarés tout en haut
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  // 2. La requête React Query
//   const { data, isLoading, isError } = useQuery({
//     queryKey: ['userMe'],
//     queryFn: async () => {
//       const res = await api.get('/users/me'); 
//       return res.data; 
//     }
//   });
    const { data: user, isLoading, isError } = useUser();

  // 3. Tes fonctions
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

  // 4. Gestion de l'attente pendant le chargement
  if (isLoading) {
    return (
      <Bottom>
        <p className="text-center pt-10">Chargement de ton profil...</p>
        <Footer />
      </Bottom>
    );
  }

  // 5. Gestion de l'erreur (si pas de token / token expiré)
  if (isError || !user) {
    return (
      <Bottom>
        <p className="text-center pt-10 text-red-500">
          Erreur : impossible de charger le profil.
        </p>
        <Footer />
      </Bottom>
    );
  }

  // 6. Rendu final avec les VRAIES données envoyées par le back ({data.xxx})
  return (
    <Bottom>
      {/* Conteneur principal du menu */}
      <div style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 50 }}>
        
        {/* Bouton Paramètres */}
        <button onClick={menu}>
          ⚙️ {isOpen ? '▲' : '▼'}
        </button>

        {/* Le volet déroulant */}
        {isOpen && (
          <div className="absolute right-0 mt-2 bg-white border border-gray-300 rounded-md p-2 shadow-md z-10 flex flex-col gap-2">
            <button
              onClick={logout}
              className="font-medium cursor-pointer text-red-500 text-left bg-transparent border-none p-0"
            >
              Logout
            </button>
            <Link 
              href="/modifyProfile"
              className="font-medium cursor-pointer text-black text-left bg-transparent border-none p-0"
            >
              Modify
            </Link>
          </div>
        )}

      </div>

      {/* Affichage des données dynamiques du back */}
      <h1 className="text-2xl font-bold w-full flex justify-center pt-6">
        {user.username}
      </h1>

      <p className="text-center text-gray-500 mt-1">
        {user.email}
      </p>

      <p className="text-center mt-4">
        {user.biography || "Aucune biographie pour le moment."}
      </p>

      <Footer />
    </Bottom>
  );
}