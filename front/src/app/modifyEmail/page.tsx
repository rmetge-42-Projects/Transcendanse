// 'use client'

// import Bottom from "@/src/display/bottom"
// import Footer from "@/src/display/footer"
// import { useState } from "react"
// import { useRouter } from "next/navigation"
// import { useForm } from 'react-hook-form'
// import { api } from '@/src/lib/axios'
// import Link from "next/link"

// type EmailFormValues = {
//     lastEmail : string;
//     newEmail: string;
// };

// export default function ModifyEmail() {
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
//         <Bottom>
//             <div className="w-full px-6 border-gray-200 py-4">
// 				<Link 
// 					href="/profile" 
// 					className="text-sm text-gray-600 hover:text-black flex items-center gap-1 transition"
// 				>
// 					← Retour au profil
// 				</Link>
// 			</div>
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
//             <Footer />
//         </Bottom>
//     );
// }