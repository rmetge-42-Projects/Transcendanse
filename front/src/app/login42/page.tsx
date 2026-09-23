"use client";

import Bottom from "@/src/display/bottom"
import { api } from "@/src/lib/axios";
import { useRouter } from "next/navigation";

export  default function Login42()
{
    const router = useRouter();
    const onSubmit = async () => {
        try {
            const res = await api.get("/auth/login42");
            console.log("Réponse serveur :", res.data); // Vérifie le contenu reçu
            
            if (res.data?.access_token) {
                localStorage.setItem('token', res.data.access_token);
                router.push("/myProfile");
            }
        } catch (error) {
            console.error("Erreur lors de la connexion 42 :", error); // Affiche l'erreur dans la console (F12)
        }
    };

    return(

        <Bottom>
            <button
                className="bg-gray-600 hover:bg-gray-700 text-white rounded p-2 mt-4 w-full transition" 
                onClick={onSubmit}
            >
                Connexion
            </button>
        </Bottom>
    )
}