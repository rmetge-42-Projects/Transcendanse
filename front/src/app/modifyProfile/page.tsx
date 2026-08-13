// import Bottom from "@/src/display/bottom"
// 'use client'
// import Footer from "@/src/display/footer"
// import { useState } from "react"
// import { useRouter } from "next/navigation"
// import { useForm } from 'react-hook-form';
// import { api } from '@/src/lib/axios';
// import { register } from "module"
// import { useUser } from "@/src/hook/useUser"
// //modifier ses info de compe
// //mettre les info acuelle dans les champ

// type ProfileFormValues = {
//     username: string;
//     kind: string;
//     orientation: string;
//     biography: string;
// };

// export  default function Modify()
// {
//     const router = useRouter();
//     const [invalide, setInvalide] = useState('');
//     const [isSumit, setIsSumbit] = useState(false);

//     const {data: user, isLoading, isError} = useUser();

//     if (isLoading) {
//         return (
//           <Bottom>
//             <p className="text-center pt-10">Chargement de ton profil...</p>
//             <Footer />
//           </Bottom>
//         );
//       }
    
//       // 5. Gestion de l'erreur (si pas de token / token expiré)
//       if (isError || !user) {
//         return (
//           <Bottom>
//             <p className="text-center pt-10 text-red-500">
//               Erreur : impossible de charger le profil.
//             </p>
//             <Footer />
//           </Bottom>
//         );
//       }

//     const {
//         register,
//         handleSubmit,
//         formState: { errors },
//     } = useForm<ProfileFormValues>();

//     const onSubmit = async (data: ProfileFormValues) => 
//     {
//         setInvalide('');
//         setIsSumbit(true);
//         data.username;
//         data.kind;
//         data.orientation;
//         data.biography;
//         try {
//             const token = localStorage.getItem('token');
//             if (token)
//             {
//                 const res = await api.post("/auth/modifyProfile", data);
//                 router.push("/profile");
//             }
//             else 
//                 setInvalide("Utilisateur non connecter");

//         }
//         catch(error)
//         {
//             setInvalide("Error, reessayer");
//         }
//         finally{
//             setIsSumbit(false);
//         }
//     }

//     return(
//         <Bottom>
//             <div className="flex flex-col iten:centers justify-center min-h-[70vh] px-4 ">
//                 <h1 className="text-blue-950 text-3xl md:text-6xl font-black text-center">
//                     Modify Profile
//                 </h1>
//                 <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md mx-auto flex flex-col gap-4 mt-6">
//                     <div className="flex flex-col gap-2">
//                         <label 
//                             className="text-sm font-semibold text-gray-700">
//                             Username
//                         </label>
//                         <input
//                             type="text"
//                             placeholder={user.username}
//                             {...register("username", {required: "Le nom d'utilisateur est obligatoire"})}
//                             className="rounded px-3 py-2 w-full bg-white border "
//                         />
//                         {errors.username && <p className="bg-red-600 text-white text-sm mt-1">{errors.username.message}</p>}
//                         <label className="text-sm font-semibold text-gray-700">
//                             Kind
//                         </label>
//                         <select
//                             {...register("kind", {required: "Le genre est obligatoire"})}
//                             className="rounded px-3 py-2 w-full bg-white border "
//                         >
//                             <option disabled hidden>
//                                 Select an option
//                             </option>
//                             <option value="man">Man</option>
//                             <option value="woman">Woman</option>
//                             <option value="non_binary">Non-binary</option>
//                         </select>
//                         {errors.kind && <p className="bg-red-600 text-white text-sm mt-1">{errors.kind.message}</p>}
//                         <label className="text-sm font-semibold text-gray-700">
//                             Sexual Orientation
//                         </label>
//                         <select
//                             {...register("orientation", {required: "L'orientation sexuelle est obligatoire"})}
//                             className="rounded px-3 py-2 w-full bg-white border "
//                         >
//                             <option disabled hidden>
//                                 Select an option
//                             </option>
//                             <option value="Men">Men</option>
//                             <option value="Woman">Weman</option>
//                             <option value="All">All</option>
//                         </select>
//                         {errors.orientation && <p className="bg-red-600 text-white text-sm mt-1">{errors.orientation.message}</p>}
//                         <label className="text-sm font-semibold text-gray-700">
//                             Biography
//                         </label>
//                         <input
//                             type="text"
//                             placeholder="j'aime les fleures ......"
//                             {...register("biography")}
//                             className="rounded  px-3 py-2 w-full bg-white border "
//                         />
//                     </div>
//                     {invalide && <p className="bg-red-600 text-white font-bold px-3 py-1 rounded-lg">{invalide}</p>}
//                     <button 
//                         type= "submit"
//                         disabled={isSumit}
//                         className="bg-blue-950 text-white rounded p-2 mt-4"
//                     >
//                         {isSumit ? "Connexion..." : "Submit"}
//                     </button>
//                 </form>
//             </div>
//             <Footer/>
//         </Bottom>
//     )
// }

'use client'

import Bottom from "@/src/display/bottom"
import Footer from "@/src/display/footer"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from 'react-hook-form'
import { useQueryClient } from '@tanstack/react-query'
import { api } from '@/src/lib/axios'
import { useUser } from "@/src/hook/useUser"
import Link from "next/link"

type ProfileFormValues = {
    username: string;
    kind: string;
    orientation: string;
    biography: string;
};

export default function Modify() {
    // 1. DÉCLARATION DE TOUS LES HOOKS EN HAUT
    const router = useRouter();
    const queryClient = useQueryClient();
    const [invalide, setInvalide] = useState('');
    const [isSubmit, setIsSubmit] = useState(false);

    // Récupération de l'utilisateur
    const { data: user, isLoading, isError } = useUser();

    // Configuration de React Hook Form avec pré-remplissage via `values`
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ProfileFormValues>({
        values: {
            username: user?.username || '',
            kind: user?.kind || '',
            orientation: user?.orientation || '',
            biography: user?.biography || '',
        }
    });

    // 2. GESTION DU CHARGEMENT ET DES ERREURS
    if (isLoading) {
        return (
            <Bottom>
                <p className="text-center pt-10">Chargement de ton profil...</p>
                <Footer />
            </Bottom>
        );
    }

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

    const passwordRedirect = () => {
		router.push("/modifyPassword");
	};

    // 3. SOUMISSION DU FORMULAIRE
    const onSubmit = async (data: ProfileFormValues) => {
        setInvalide('');
        setIsSubmit(true);
        try {
            // L'intercepteur Axios injecte déjà le token Bearer
            await api.post("/auth/modifyProfile", data);
            
            // Invalidation du cache pour forcer le rafraîchissement des données du profil
            await queryClient.invalidateQueries({ queryKey: ['userMe'] });
            
            router.push("/profile");
        } catch (error) {
            setInvalide("Erreur lors de la modification, réessayez.");
        } finally {
            setIsSubmit(false);
        }
    };

    return (
        <Bottom>
            <div className="w-full px-6 border-gray-200 py-4">
				<Link 
					href="/profile" 
					className="text-sm text-gray-600 hover:text-black flex items-center gap-1 transition"
				>
					← Retour au profil
				</Link>
			</div>
            <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
                <h1 className="text-blue-950 text-3xl md:text-6xl font-black text-center">
                    Modify Profile
                </h1>
                <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md mx-auto flex flex-col gap-4 mt-6">
                    <div className="flex flex-col gap-2">
                        {/* USERNAME */}
                        <label className="text-sm font-semibold text-gray-700">
                            Username
                        </label>
                        <input
                            type="text"
                            {...register("username", { required: "Le nom d'utilisateur est obligatoire" })}
                            className="rounded px-3 py-2 w-full bg-white border"
                        />
                        {errors.username && <p className="bg-red-600 text-white text-sm mt-1 p-1 rounded">{errors.username.message}</p>}

                        {/* KIND */}
                        <label className="text-sm font-semibold text-gray-700">
                            Kind
                        </label>
                        <select
                            {...register("kind", { required: "Le genre est obligatoire" })}
                            className="rounded px-3 py-2 w-full bg-white border"
                        >
                            <option value="" disabled hidden>
                                Select an option
                            </option>
                            <option value="man">Man</option>
                            <option value="woman">Woman</option>
                            <option value="non_binary">Non-binary</option>
                        </select>
                        {errors.kind && <p className="bg-red-600 text-white text-sm mt-1 p-1 rounded">{errors.kind.message}</p>}

                        {/* ORIENTATION */}
                        <label className="text-sm font-semibold text-gray-700">
                            Sexual Orientation
                        </label>
                        <select
                            {...register("orientation", { required: "L'orientation sexuelle est obligatoire" })}
                            className="rounded px-3 py-2 w-full bg-white border"
                        >
                            <option value="" disabled hidden>
                                Select an option
                            </option>
                            <option value="man">Man</option>
                            <option value="woman">Weman</option>
                            <option value="all">All</option>
                        </select>
                        {errors.orientation && <p className="bg-red-600 text-white text-sm mt-1 p-1 rounded">{errors.orientation.message}</p>}

                        {/* BIOGRAPHY */}
                        <label className="text-sm font-semibold text-gray-700">
                            Biography
                        </label>
                        <input
                            type="text"
                            {...register("biography")}
                            className="rounded px-3 py-2 w-full bg-white border"
                        />
                    </div>

                    {invalide && <p className="bg-red-600 text-white font-bold px-3 py-1 rounded-lg">{invalide}</p>}

                    <button 
                        type="submit"
                        disabled={isSubmit}
                        className="bg-blue-950 text-white rounded p-2 mt-4 cursor-pointer disabled:bg-gray-400"
                    >
                        {isSubmit ? "Envoi..." : "Submit"}
                    </button>
                </form>
                <button 
					className="bg-gray-600 hover:bg-gray-700 text-white rounded p-2 mt-4 cursor-pointer disabled:bg-gray-400" 
					onClick={passwordRedirect}
                    >
					Modify Password
				</button>
            </div>
            <Footer />
        </Bottom>
    );
}