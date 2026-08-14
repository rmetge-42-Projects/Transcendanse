
// import { useState } from "react"
// import Bottom from "../display/bottom"
// import { useRouter } from "next/navigation"
// import { useForm } from 'react-hook-form'
// import { useQueryClient } from '@tanstack/react-query'
// import { api } from '@/src/lib/axios'
// import { useUser } from "@/src/hook/useUser"


// type ProfileFormValues = {
//     username: string;
//     kind: string;
//     orientation: string;
//     biography: string;
// };

// export default function Profile() {
//     // 1. DÉCLARATION DE TOUS LES HOOKS EN HAUT
//     const router = useRouter();
//     const queryClient = useQueryClient();
//     const [invalide, setInvalide] = useState('');
//     const [isSubmit, setIsSubmit] = useState(false);
    
//     // Récupération de l'utilisateur
//     const { data: user, isLoading, isError } = useUser();
    
//     // Configuration de React Hook Form avec pré-remplissage via `values`
//     const {
//         register,
//         handleSubmit,
//         formState: { errors },
//     } = useForm<ProfileFormValues>({
//         values: {
//             username: user?.username || '',
//             kind: user?.kind || '',
//             orientation: user?.orientation || '',
//             biography: user?.biography || '',
//         }
//     });
    
//     // 2. GESTION DU CHARGEMENT ET DES ERREURS
//     if (isLoading) {
//         return (
//             <Bottom>
//             <p className="text-center pt-10">Chargement de ton profil...</p>
//             </Bottom>
//     );
//     }

//     if (isError || !user) {
//         return (
//             <Bottom>
//                 <p className="text-center pt-10 text-red-500">
//                     Erreur : impossible de charger le profil.
//                 </p>
//             </Bottom>
//         );
//     }
//     const onSubmit = async (data: ProfileFormValues) => {
//         setInvalide('');
//         setIsSubmit(true);
//         try {
//             // L'intercepteur Axios injecte déjà le token Bearer
//             await api.post("/users/modifyProfile", data);

//             // Invalidation du cache pour forcer le rafraîchissement des données du profil
//             await queryClient.invalidateQueries({ queryKey: ['userMe'] });

//             router.push("/profile");
//         } catch (error) {
//             setInvalide("Erreur lors de la modification, réessayez.");
//         } finally {
//             setIsSubmit(false);
//         }
//     };

//     return (
//         <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
//             <h1 className="text-blue-950 text-3xl md:text-6xl font-black text-center">
//                 Modify Profile
//             </h1>
//             <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md mx-auto flex flex-col gap-4 mt-6">
//                 <div className="flex flex-col gap-2">
//                     {/* USERNAME */}
//                     <label className="text-sm font-semibold text-gray-700">
//                         Username
//                     </label>
//                     <input
//                         type="text"
//                         {...register("username", { required: "Le nom d'utilisateur est obligatoire" })}
//                         className="rounded px-3 py-2 w-full bg-white border"
//                         />
//                     {errors.username && <p className="bg-red-600 text-white text-sm mt-1 p-1 rounded">{errors.username.message}</p>}
//                     {/* KIND */}
//                     <label className="text-sm font-semibold text-gray-700">
//                         Kind
//                     </label>
//                     <select
//                         {...register("kind", { required: "Le genre est obligatoire" })}
//                         className="rounded px-3 py-2 w-full bg-white border"
//                         >
//                         <option value="" disabled hidden>
//                             Select an option
//                         </option>
//                         <option value="man">Man</option>
//                         <option value="woman">Woman</option>
//                         <option value="non_binary">Non-binary</option>
//                     </select>
//                     {errors.kind && <p className="bg-red-600 text-white text-sm mt-1 p-1 rounded">{errors.kind.message}</p>}
//                     {/* ORIENTATION */}
//                     <label className="text-sm font-semibold text-gray-700">
//                         Sexual Orientation
//                     </label>
//                     <select
//                         {...register("orientation", { required: "L'orientation sexuelle est obligatoire" })}
//                         className="rounded px-3 py-2 w-full bg-white border"
//                         >
//                         <option value="" disabled hidden>
//                             Select an option
//                         </option>
//                         <option value="man">Man</option>
//                         <option value="woman">Woman</option>
//                         <option value="all">All</option>
//                     </select>
//                     {errors.orientation && <p className="bg-red-600 text-white text-sm mt-1 p-1 rounded">{errors.orientation.message}</p>}
//                     {/* BIOGRAPHY */}
//                     <label className="text-sm font-semibold text-gray-700">
//                         Biography
//                     </label>
//                     <input
//                         type="text"
//                         {...register("biography")}
//                         className="rounded px-3 py-2 w-full bg-white border"
//                         />
//                 </div>
//                 {invalide && <p className="bg-red-600 text-white font-bold px-3 py-1 rounded-lg">{invalide}</p>}
//                 <button 
//                     type="submit"
//                     disabled={isSubmit}
//                     className="bg-blue-950 text-white rounded p-2 mt-4 cursor-pointer disabled:bg-gray-400"
//                     >
//                     {isSubmit ? "Envoi..." : "Submit"}
//                 </button>
//             </form>
//         </div>
//     )
// }

'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from 'react-hook-form'
import { useQueryClient } from '@tanstack/react-query'
import { api } from '@/src/lib/axios'
import { useUser } from "@/src/hook/useUser"

type ProfileFormValues = {
    username: string;
    kind: string;
    orientation: string;
    biography: string;
};

export default function Profile() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [invalide, setInvalide] = useState('');
    const [isSubmit, setIsSubmit] = useState(false);
    
    const { data: user, isLoading, isError } = useUser();
    
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
    
    if (isLoading) return <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm animate-pulse text-center text-gray-400">Chargement...</div>;
    if (isError || !user) return <div className="bg-white p-6 rounded-2xl border border-red-100 text-red-500 text-center">Erreur lors du chargement du profil.</div>;

    const onSubmit = async (data: ProfileFormValues) => {
        setInvalide('');
        setIsSubmit(true);
        try {
            await api.post("/users/modifyProfile", data);
            await queryClient.invalidateQueries({ queryKey: ['userMe'] });
            router.push("/profile");
        } catch {
            setInvalide("Erreur lors de la modification, réessayez.");
        } finally {
            setIsSubmit(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-3">
                Informations du profil
            </h2>

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 mt-4">
                {/* USERNAME */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nom d'utilisateur
                    </label>
                    <input
                        type="text"
                        {...register("username", { required: "Le nom d'utilisateur est obligatoire" })}
                        className="w-full rounded-lg px-3.5 py-2 bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent text-sm transition"
                    />
                    {errors.username && <p className="text-red-500 text-xs mt-1 font-medium">{errors.username.message}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* KIND */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Genre
                        </label>
                        <select
                            {...register("kind", { required: "Le genre est obligatoire" })}
                            className="w-full rounded-lg px-3.5 py-2 bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-900 text-sm transition"
                        >
                            <option value="" disabled hidden>Sélectionner</option>
                            <option value="man">Homme</option>
                            <option value="woman">Femme</option>
                            <option value="non_binary">Non-binaire</option>
                        </select>
                        {errors.kind && <p className="text-red-500 text-xs mt-1 font-medium">{errors.kind.message}</p>}
                    </div>

                    {/* ORIENTATION */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Orientation sexuelle
                        </label>
                        <select
                            {...register("orientation", { required: "L'orientation est obligatoire" })}
                            className="w-full rounded-lg px-3.5 py-2 bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-900 text-sm transition"
                        >
                            <option value="" disabled hidden>Sélectionner</option>
                            <option value="man">Homme</option>
                            <option value="woman">Femme</option>
                            <option value="all">Tous</option>
                        </select>
                        {errors.orientation && <p className="text-red-500 text-xs mt-1 font-medium">{errors.orientation.message}</p>}
                    </div>
                </div>

                {/* BIOGRAPHY */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Biographie
                    </label>
                    <textarea
                        rows={3}
                        {...register("biography")}
                        className="w-full rounded-lg px-3.5 py-2 bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-900 text-sm transition resize-none"
                    />
                </div>

                {invalide && <p className="text-red-500 text-sm font-medium">{invalide}</p>}

                <button 
                    type="submit"
                    disabled={isSubmit}
                    className="self-end bg-blue-950 hover:bg-blue-900 text-white font-medium rounded-lg px-5 py-2.5 text-sm transition cursor-pointer disabled:bg-gray-300"
                >
                    {isSubmit ? "Enregistrement..." : "Enregistrer les modifications"}
                </button>
            </form>
        </div>
    )
}