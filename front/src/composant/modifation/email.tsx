

'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from 'react-hook-form'
import { api } from '@/src/lib/axios'
import EditCard from "./editCard"
import { getErrorMessage } from "@/src/lib/errors";
import { useQueryClient } from "@tanstack/react-query"

type EmailFormValues = {
    lastEmail: string;
    newEmail: string;
};

export default function Email() {
    const router = useRouter();
    const [invalide, setInvalide] = useState('');
    const [isSubmit, setIsSubmit] = useState(false);
    const queryClient = useQueryClient();

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
            await queryClient.invalidateQueries({ queryKey: ['userMe'] });
            router.push("/myProfile");
        } catch (error) {
            setInvalide(getErrorMessage(error, "Une erreur est survenue, réessayez."));
        } finally {
            setIsSubmit(false);
        }
    };

    return (
        <EditCard title="Adresse e-mail">
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
        {/* </div */}
        </EditCard>
    );
}