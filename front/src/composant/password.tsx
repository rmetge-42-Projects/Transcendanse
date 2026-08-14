// import { useState } from "react"
// import { useRouter } from "next/navigation"
// import { useForm } from 'react-hook-form'
// import { api } from '@/src/lib/axios'

// type PasswordFormValues = {
//     lastPass: string;
//     newPass: string;
//     verifNewPass: string;
// };

// export default function Password()
// {
//      const router = useRouter();
//     const [invalide, setInvalide] = useState('');
//     const [isSubmit, setIsSubmit] = useState(false);
//     const [shownLastPass, setShowLastPass] = useState(false);
//     const [showNewPass, setShowNewPass] = useState(false);
//     const [showVerifNewPass, setShowVerifNewPass] = useState(false);

//     // Configuration de React Hook Form avec pré-remplissage via `values`
//     const {
//         register,
//         handleSubmit,
//         formState: { errors },
//     } = useForm<PasswordFormValues>({
//         values: {
//             lastPass: '',
//             newPass: '',
//             verifNewPass: '',
//         }
//     });

//     // 3. SOUMISSION DU FORMULAIRE
//     const onSubmit = async (data: PasswordFormValues) => {
//         setInvalide('');
//         setIsSubmit(true);
//         try {
//             // L'intercepteur Axios injecte déjà le token Bearer
//             await api.post("/auth/modifyPassword", data);
            
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
//                 Modify Password
//             </h1>
//             <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md mx-auto flex flex-col gap-4 mt-6">
//                 <div className="flex flex-col gap-2">
//                     <label className="text-sm font-semibold text-gray-700">
//                         Last Password
//                     </label>
//                     <div className="relative w-full">
//                         <input
//                             type={shownLastPass ? 'text' : 'password'}
//                             {...register("lastPass", { required: "Le nom d'utilisateur est obligatoire" })}
//                             className="rounded px-3 py-2 w-full bg-white border"
//                         />
//                         <button
//                             type="button"
//                             onClick={() => setShowLastPass(!shownLastPass)}
//                             className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer rounded-full focus:outline-none"
//                             aria-label={shownLastPass ? "Masquer" : "Afficher"}
//                         >
//                             {shownLastPass ? (
//                                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
//                                     <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
//                                 </svg>
//                             ) : (
//                                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
//                                     <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12c1.274 4.057 5.065 7 9.964 7 4.899 0 8.69-2.943 9.964-7-1.274-4.057-5.065-7-9.964-7-4.899 0-8.69 2.943-9.964 7z" />
//                                     <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
//                                 </svg>
//                             )}
//                         </button>
//                     </div>
//                     {errors.lastPass && <p className="bg-red-600 text-white text-sm mt-1 p-1 rounded">{errors.lastPass.message}</p>}
                    
//                     <label className="text-sm font-semibold text-gray-700">
//                         New Password
//                     </label>
//                     <div className="relative w-full">
//                         <input
//                             type={showNewPass ? 'text' : 'password'}
//                             {...register("newPass", { required: "Le genre est obligatoire" })}
//                             className="rounded px-3 py-2 w-full bg-white border"
//                         />
//                         <button
//                             type="button"
//                             onClick={() => setShowNewPass(!showNewPass)}
//                             className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer rounded-full focus:outline-none"
//                             aria-label={showNewPass ? "Masquer" : "Afficher"}
//                         >
//                             {showNewPass ? (
//                                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
//                                     <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
//                                 </svg>
//                             ) : (
//                                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
//                                     <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12c1.274 4.057 5.065 7 9.964 7 4.899 0 8.69-2.943 9.964-7-1.274-4.057-5.065-7-9.964-7-4.899 0-8.69 2.943-9.964 7z" />
//                                     <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
//                                 </svg>
//                             )}
//                         </button>
//                     </div>
//                     {errors.newPass && <p className="bg-red-600 text-white text-sm mt-1 p-1 rounded">{errors.newPass.message}</p>}
//                     <label className="text-sm font-semibold text-gray-700">
//                         Verify New Password
//                     </label>
                    
//                     <div className="relative w-full">
//                         <input
//                             type={showVerifNewPass ? 'text' : 'password'}
//                             {...register("verifNewPass", { required: "L'orientation sexuelle est obligatoire" })}
//                             className="rounded px-3 py-2 w-full bg-white border"
//                         />
//                         <button
//                             type="button"
//                             onClick={() => setShowVerifNewPass(!showVerifNewPass)}
//                             className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer rounded-full focus:outline-none"
//                             aria-label={showVerifNewPass ? "Masquer" : "Afficher"}
//                         >
//                             {showVerifNewPass ? (
//                                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
//                                     <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
//                                 </svg>
//                             ) : (
//                                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
//                                     <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12c1.274 4.057 5.065 7 9.964 7 4.899 0 8.69-2.943 9.964-7-1.274-4.057-5.065-7-9.964-7-4.899 0-8.69 2.943-9.964 7z" />
//                                     <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
//                                 </svg>
//                             )}
//                         </button>
//                     </div>
//                     {errors.verifNewPass && <p className="bg-red-600 text-white text-sm mt-1 p-1 rounded">{errors.verifNewPass.message}</p>}
//                 </div>
//                 {invalide && <p className="bg-red-600 text-white font-bold px-3 py-1 rounded-lg">{invalide}</p>}
//                 <button 
//                     type="submit"
//                     disabled={isSubmit}
//                     className="bg-blue-950 text-white rounded p-2 mt-4 cursor-pointer disabled:bg-gray-400"
//                 >
//                     {isSubmit ? "Envoi..." : "Submit"}
//                 </button>
//             </form>
//         </div>
//     );
// }


'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from 'react-hook-form'
import { api } from '@/src/lib/axios'

type PasswordFormValues = {
    lastPass: string;
    newPass: string;
    verifNewPass: string;
};

export default function Password() {
    const router = useRouter();
    const [invalide, setInvalide] = useState('');
    const [isSubmit, setIsSubmit] = useState(false);
    const [shownLastPass, setShowLastPass] = useState(false);
    const [showNewPass, setShowNewPass] = useState(false);
    const [showVerifNewPass, setShowVerifNewPass] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<PasswordFormValues>();

    const onSubmit = async (data: PasswordFormValues) => {
        setInvalide('');
        setIsSubmit(true);
        try {
            await api.post("/auth/password", data);
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
                Sécurité du mot de passe
            </h2>

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 mt-4">
                {/* ANCIEN MDP */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ancien mot de passe
                    </label>
                    <div className="relative w-full">
                        <input
                            type={shownLastPass ? 'text' : 'password'}
                            {...register("lastPass", { required: "L'ancien mot de passe est obligatoire" })}
                            className="w-full rounded-lg px-3.5 py-2 pr-10 bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-900 text-sm transition"
                        />
                        <button
                            type="button"
                            onClick={() => setShowLastPass(!shownLastPass)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d={shownLastPass ? "M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" : "M2.036 12c1.274 4.057 5.065 7 9.964 7 4.899 0 8.69-2.943 9.964-7-1.274-4.057-5.065-7-9.964-7-4.899 0-8.69 2.943-9.964 7z M15 12a3 3 0 11-6 0 3 3 0 016 0z"} />
                            </svg>
                        </button>
                    </div>
                    {errors.lastPass && <p className="text-red-500 text-xs mt-1 font-medium">{errors.lastPass.message}</p>}
                </div>

                {/* NOUVEAU MDP */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nouveau mot de passe
                    </label>
                    <div className="relative w-full">
                        <input
                            type={showNewPass ? 'text' : 'password'}
                            {...register("newPass", { required: "Le nouveau mot de passe est obligatoire" })}
                            className="w-full rounded-lg px-3.5 py-2 pr-10 bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-900 text-sm transition"
                        />
                        <button
                            type="button"
                            onClick={() => setShowNewPass(!showNewPass)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d={showNewPass ? "M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" : "M2.036 12c1.274 4.057 5.065 7 9.964 7 4.899 0 8.69-2.943 9.964-7-1.274-4.057-5.065-7-9.964-7-4.899 0-8.69 2.943-9.964 7z M15 12a3 3 0 11-6 0 3 3 0 016 0z"} />
                            </svg>
                        </button>
                    </div>
                    {errors.newPass && <p className="text-red-500 text-xs mt-1 font-medium">{errors.newPass.message}</p>}
                </div>

                {/* VERIFICATION NOUVEAU MDP */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mettre à jour le mot de passe
                    </label>
                    <div className="relative w-full">
                        <input
                            type={showVerifNewPass ? 'text' : 'password'}
                            {...register("verifNewPass", { required: "La confirmation est obligatoire" })}
                            className="w-full rounded-lg px-3.5 py-2 pr-10 bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-900 text-sm transition"
                        />
                        <button
                            type="button"
                            onClick={() => setShowVerifNewPass(!showVerifNewPass)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d={showVerifNewPass ? "M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" : "M2.036 12c1.274 4.057 5.065 7 9.964 7 4.899 0 8.69-2.943 9.964-7-1.274-4.057-5.065-7-9.964-7-4.899 0-8.69 2.943-9.964 7z M15 12a3 3 0 11-6 0 3 3 0 016 0z"} />
                            </svg>
                        </button>
                    </div>
                    {errors.verifNewPass && <p className="text-red-500 text-xs mt-1 font-medium">{errors.verifNewPass.message}</p>}
                </div>

                {invalide && <p className="text-red-500 text-sm font-medium">{invalide}</p>}

                <button 
                    type="submit"
                    disabled={isSubmit}
                    className="self-end bg-blue-950 hover:bg-blue-900 text-white font-medium rounded-lg px-5 py-2.5 text-sm transition cursor-pointer disabled:bg-gray-300"
                >
                    {isSubmit ? "Envoi..." : "Modifier le mot de passe"}
                </button>
            </form>
        </div>
    );
}