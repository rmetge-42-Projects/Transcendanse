'use client'
import Bottom from "@/src/component/display/bottom"
import { useRouter } from "next/navigation";
import Footer from "@/src/component/footer";
import { useState } from "react";
import Modify from "../modifyProfile/page";
import Link from "next/link";

export default function Profile(){
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    function menu() {
        setIsOpen(!isOpen);
    }
    function logout() {
      // 1. Demander une confirmation à l'utilisateur
      const confirmLogout = window.confirm("Es-tu sûr de vouloir te déconnecter ?");
        
      if (confirmLogout) {
        // 2. Supprimer le token du localStorage
        localStorage.removeItem('token');
    
        // 3. Rediriger vers la page d'accueil
        router.push('/');
      }
    }
    return(
        <Bottom>
            {/* Conteneur principal du menu */}
            <div style={{ position: 'absolute', top: '16px', right:'16px', zIndex: 50 }}>
                
                {/* 2. Bouton  */}
                <button onClick={menu}>
                    ⚙️ {isOpen ? '▲' : '▼'}
                </button>

                {/* 3. Le volet déroulant  */}
                {isOpen && (
                    <div className="absolute right-0 mt-2 bg-white border border-gray-300 rounded-md p-2 shadow-md z-10 flex flex-col gap-2">
                        <button
                            onClick={logout}
                            className="font-medium cursor-pointer text-red-500 text-left bg-transparent border-none p-0"
                        >
                        Logout
                        </button>
                        <Link href="/modifyProfile"
                            className="font-medium cursor-pointer text-black text-left bg-transparent border-none p-0"
                        >
                        Modify
                        </Link>
                    </div>
                )}

            </div>

            <h1 
                className="text-2xl font-bold w-full flex justify-center pt-6"
            >
            your name
            </h1>
            <p>
                bio
            </p>

            <Footer/>
        </Bottom>
    );
}