'use client'

import { clearAuthToken } from '@/src/lib/authToken';
import { socket } from '@/src/lib/socket';
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from 'react-hook-form'
import { api } from '@/src/lib/axios'
import { Eye, EyeOff } from "lucide-react"
import EditCard from "./editCard"
import { getErrorMessage } from "@/src/lib/errors";
import { useQueryClient } from "@tanstack/react-query"

type PasswordFormValues = {
    lastPass: string;
    newPass: string;
    verifNewPass: string;
};

export default function Password() {
    const router = useRouter();
    const [invalide, setInvalide] = useState('');
    const [isSubmit, setIsSubmit] = useState(false);
    const [showLastPass, setShowLastPass] = useState(false);
    const [showNewPass, setShowNewPass] = useState(false);
    const [showVerifNewPass, setShowVerifNewPass] = useState(false);
    const queryClient = useQueryClient()

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
            clearAuthToken();
            socket.disconnect();
            queryClient.clear();
            router.replace("/login");
        } catch (error) {
            setInvalide(getErrorMessage(error, "Une erreur est survenue, réessayez."));
        } finally {
            setIsSubmit(false);
        }
    };
    
    return (
        <EditCard title="Mot de passe">

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 mt-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ancien mot de passe
                    </label>
                    <div className="relative w-full">
                        <input
                            type={showLastPass ? 'text' : 'password'}
                            {...register("lastPass", { required: "L'ancien mot de passe est obligatoire" })}
                            className="w-full rounded-lg px-3.5 py-2 pr-10 bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-900 text-sm transition text-black"
                            />
                        <button
                            type="button"
                            onClick={() => setShowLastPass(!showLastPass)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
                            >
                            {showLastPass ?(
                                <EyeOff />
                            ) : (
                                <Eye />
                            )}
                        </button>
                    </div>
                    {errors.lastPass && <p className="text-red-500 text-xs mt-1 font-medium">{errors.lastPass.message}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nouveau mot de passe
                    </label>
                    <div className="relative w-full">
                        <input
                            type={showNewPass ? 'text' : 'password'}
                            {...register("newPass", { required: "Le nouveau mot de passe est obligatoire" })}
                            className="w-full rounded-lg px-3.5 py-2 pr-10 bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-900 text-sm transition text-black"
                            />
                        <button
                            type="button"
                            onClick={() => setShowNewPass(!showNewPass)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
                            >
                            {showNewPass ?(
                                <EyeOff />
                            ) : (
                                <Eye />
                            )}
                        </button>
                    </div>
                    {errors.newPass && <p className="text-red-500 text-xs mt-1 font-medium">{errors.newPass.message}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mettre à jour le mot de passe
                    </label>
                    <div className="relative w-full">
                        <input
                            type={showVerifNewPass ? 'text' : 'password'}
                            {...register("verifNewPass", { required: "La confirmation est obligatoire" })}
                            className="w-full rounded-lg px-3.5 py-2 pr-10 bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-900 text-sm transition text-black"
                            />
                        <button
                            type="button"
                            onClick={() => setShowVerifNewPass(!showVerifNewPass)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
                            >
                            {showVerifNewPass ?(
                                <EyeOff />
                            ) : (
                                <Eye />
                            )}
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
        </EditCard>
    );
}