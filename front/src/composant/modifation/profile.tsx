'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from 'react-hook-form'
import { useQueryClient } from '@tanstack/react-query'
import { api } from '@/src/lib/axios'
import { useUser } from "@/src/hook/useUser"
import EditCard from "./editCard"
import AvatarPicker from "@/src/composant/profile/AvatarPicker"

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
    
    const [preview, setPreview] = useState<string | null>(user?.photo || null);
    const [croppedFile, setCroppedFile] = useState<File | null>(null);

    // Mettre à jour l'aperçu si les données utilisateur arrivent
    useEffect(() => {
        if (user?.photo) {
            setPreview(user.photo);
        }
    }, [user?.photo]);
    
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

    const handlePhotoChange = (file: File | null, dataUrl: string | null) => {
        setCroppedFile(file);
        setPreview(dataUrl);
    };
    
    if (isLoading) return <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm animate-pulse text-center text-gray-400">Chargement...</div>;
    if (isError || !user) return <div className="bg-white p-6 rounded-2xl border border-red-100 text-red-500 text-center">Erreur lors du chargement du profil.</div>;

    const onSubmit = async (data: ProfileFormValues) => {
        setInvalide('');
        setIsSubmit(true);
        try {
            const payload = {
                ...data,
                photo: preview ?? null,
            };
            await api.put('/users/updateProfile', payload);
            // alert("Profil mis à jour avec succès !");
            await queryClient.invalidateQueries({ queryKey: ['userMe'] });
            router.push("/myProfile");
        } catch {
            setInvalide("Erreur lors de la mise à jour, réessayez.");
        } finally {
            setIsSubmit(false);
        }
    };


    return (
        <EditCard title="Information du profil">

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 mt-4">
                {/* PHOTO DE PROFIL & MENU D'OPTIONS */}
                <div className="flex justify-center p-4 bg-gray-50/80 rounded-2xl border border-gray-100 mb-2">
                    <AvatarPicker
                        value={preview}
                        onChange={handlePhotoChange}
                    />
                </div>
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
        </EditCard>
    )
}