// import { useState } from "react"
// import { useRouter } from "next/navigation"
// import { useForm } from 'react-hook-form'
// import { api } from '@/src/lib/axios'
// import Link from "next/link"

// type EmailFormValues = {
//     lastEmail : string;
//     newEmail: string;
// };

// export default function Email() {
//     // 1. DÉCLARATION DE TOUS LES HOOKS EN HAUT
//     const router = useRouter();
//     const [invalide, setInvalide] = useState('');
//     const [isSubmit, setIsSubmit] = useState(false);

//     // Configuration de React Hook Form avec pré-remplissage via `values`
//     const {
//         register,
//         handleSubmit,
//         formState: { errors },
//     } = useForm<EmailFormValues>({
//         values: {
//             lastEmail: '',
//             newEmail: '',
//         }
//     });

//     // 3. SOUMISSION DU FORMULAIRE
//     const onSubmit = async (data: EmailFormValues) => {
//         setInvalide('');
//         setIsSubmit(true);
//         try {
//             // L'intercepteur Axios injecte déjà le token Bearer
//             await api.post("/auth/modifyEmail", data);
            
//             router.push("/profile");
//         } catch (error) {
//             setInvalide("Erreur lors de la modification, réessayez.");
//         } finally {
//             setIsSubmit(false);
//         }
//     };

//     return (
//             <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
//                 <h1 className="text-blue-950 text-3xl md:text-6xl font-black text-center">
//                     Modify Email
//                 </h1>

//                 <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md mx-auto flex flex-col gap-4 mt-6">
//                     <div className="flex flex-col gap-2">

//                         <label className="text-sm font-semibold text-gray-700">
//                             Last Email
//                         </label>
//                         <input
//                             type='text' 
//                             {...register("lastEmail", { required: "Le nom d'utilisateur est obligatoire" })}
//                             className="rounded px-3 py-2 w-full bg-white border"
//                         />

//                         {errors.lastEmail && <p className="bg-red-600 text-white text-sm mt-1 p-1 rounded">{errors.lastEmail.message}</p>}
//                         <label className="text-sm font-semibold text-gray-700">
//                             New Email
//                         </label>
//                         <input
//                             type='text'
//                             {...register("newEmail", { required: "L'orientation sexuelle est obligatoire" })}
//                             className="rounded px-3 py-2 w-full bg-white border"
//                         />
                        
//                         {errors.newEmail && <p className="bg-red-600 text-white text-sm mt-1 p-1 rounded">{errors.newEmail.message}</p>}
//                     </div>

//                     {invalide && <p className="bg-red-600 text-white font-bold px-3 py-1 rounded-lg">{invalide}</p>}

//                     <button 
//                         type="submit"
//                         disabled={isSubmit}
//                         className="bg-blue-950 text-white rounded p-2 mt-4 cursor-pointer disabled:bg-gray-400"
//                     >
//                         {isSubmit ? "Envoi..." : "Submit"}
//                     </button>
//                 </form>
//             </div>
//     );
// }

'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from 'react-hook-form'
import { api } from '@/src/lib/axios'

type EmailFormValues = {
    lastEmail: string;
    newEmail: string;
};

export default function Email() {
    const router = useRouter();
    const [invalide, setInvalide] = useState('');
    const [isSubmit, setIsSubmit] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<EmailFormValues>();

    const onSubmit = async (data: EmailFormValues) => {
        setInvalide('');
        setIsSubmit(true);
        try {
            await api.post("/auth/Email", data);
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
                Adresse e-mail
            </h2>

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 mt-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ancien e-mail
                    </label>
                    <input
                        type="email" 
                        {...register("lastEmail", { required: "L'ancien email est obligatoire" })}
                        className="w-full rounded-lg px-3.5 py-2 bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-900 text-sm transition"
                    />
                    {errors.lastEmail && <p className="text-red-500 text-xs mt-1 font-medium">{errors.lastEmail.message}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nouveau e-mail
                    </label>
                    <input
                        type="email"
                        {...register("newEmail", { required: "Le nouvel email est obligatoire" })}
                        className="w-full rounded-lg px-3.5 py-2 bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-900 text-sm transition"
                    />
                    {errors.newEmail && <p className="text-red-500 text-xs mt-1 font-medium">{errors.newEmail.message}</p>}
                </div>

                {invalide && <p className="text-red-500 text-sm font-medium">{invalide}</p>}

                <button 
                    type="submit"
                    disabled={isSubmit}
                    className="self-end bg-blue-950 hover:bg-blue-900 text-white font-medium rounded-lg px-5 py-2.5 text-sm transition cursor-pointer disabled:bg-gray-300"
                >
                    {isSubmit ? "Envoi..." : "Changer l'e-mail"}
                </button>
            </form>
        </div>
    );
}