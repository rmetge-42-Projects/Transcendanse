'use client'

import Bottom from "@/src/display/bottom"
import Footer from "@/src/display/footer"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from 'react-hook-form'
import { api } from '@/src/lib/axios'
import Link from "next/link"

type PasswordFormValues = {
    lastPass: string;
    newPass: string;
    verifNewPass: string;
};

export default function Modify() {
    // 1. DÉCLARATION DE TOUS LES HOOKS EN HAUT
    const router = useRouter();
    const [invalide, setInvalide] = useState('');
    const [isSubmit, setIsSubmit] = useState(false);

    // Configuration de React Hook Form avec pré-remplissage via `values`
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<PasswordFormValues>({
        values: {
            lastPass: '',
            newPass: '',
            verifNewPass: '',
        }
    });

    // 3. SOUMISSION DU FORMULAIRE
    const onSubmit = async (data: PasswordFormValues) => {
        setInvalide('');
        setIsSubmit(true);
        try {
            // L'intercepteur Axios injecte déjà le token Bearer
            await api.post("/auth/modifyPassword", data);
            
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
                    Modify Password
                </h1>
                <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md mx-auto flex flex-col gap-4 mt-6">
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-gray-700">
                            Last Password
                        </label>
                        <input
                            type="text"
                            {...register("lastPass", { required: "Le nom d'utilisateur est obligatoire" })}
                            className="rounded px-3 py-2 w-full bg-white border"
                        />
                        {errors.lastPass && <p className="bg-red-600 text-white text-sm mt-1 p-1 rounded">{errors.lastPass.message}</p>}
                        <label className="text-sm font-semibold text-gray-700">
                            New Password
                        </label>
                        <input
                            {...register("newPass", { required: "Le genre est obligatoire" })}
                            className="rounded px-3 py-2 w-full bg-white border"
                        />
                        {errors.newPass && <p className="bg-red-600 text-white text-sm mt-1 p-1 rounded">{errors.newPass.message}</p>}

                        <label className="text-sm font-semibold text-gray-700">
                            Verify New Password
                        </label>
                        <input
                            {...register("verifNewPass", { required: "L'orientation sexuelle est obligatoire" })}
                            className="rounded px-3 py-2 w-full bg-white border"
                        />
                        {errors.verifNewPass && <p className="bg-red-600 text-white text-sm mt-1 p-1 rounded">{errors.verifNewPass.message}</p>}
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
            </div>
            <Footer />
        </Bottom>
    );
}