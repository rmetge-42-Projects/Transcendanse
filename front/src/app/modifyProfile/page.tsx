'use client'
import Bottom from "@/src/component/display/bottom"
import Footer from "@/src/component/footer"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from 'react-hook-form';
import { api } from '@/src/lib/axios';
import { register } from "module"
//modifier ses info de compe
//mettre les info acuelle dans les champ

type ProfileFormValues = {
    username: string;
    kind: string;
    orientation: string;
    biography: string;
};

export  default function Modify()
{
    const router = useRouter();
    const [invalide, setInvalide] = useState('');
    const [isSumit, setIsSumbit] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ProfileFormValues>();

    const onSubmit = async (data: ProfileFormValues) => 
    {
        setInvalide('');
        setIsSumbit(true);
        data.username;
        data.kind;
        data.orientation;
        data.biography;
        try {
            const token = localStorage.getItem('token');
            if (token)
            {
                const res = await api.post("/auth/modifyProfile", data);
                router.push("/profile");
            }
            else 
                setInvalide("Utilisateur non connecter");

        }
        catch(error)
        {
            setInvalide("Error, reessayer");
        }
        finally{
            setIsSumbit(false);
        }
    }

    return(
        <Bottom>
            <div className="flex flex-col iten:centers justify-center min-h-[70vh] px-4 ">
                <h1 className="text-blue-950 text-3xl md:text-6xl font-black text-center">
                    Modify Profile
                </h1>
                <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md mx-auto flex flex-col gap-4 mt-6">
                    <div className="flex flex-col gap-2">
                        <label 
                            className="text-sm font-semibold text-gray-700">
                            Username
                        </label>
                        <input
                            type="text"
                            placeholder="ex: alex_dev"
                            {...register("username", {required: "Le nom d'utilisateur est obligatoire"})}
                            className="rounded px-3 py-2 w-full bg-white border "
                        />
                        {errors.username && <p className="bg-red-600 text-white text-sm mt-1">{errors.username.message}</p>}
                        <label className="text-sm font-semibold text-gray-700">
                            Kind
                        </label>
                        <select
                            {...register("kind", {required: "Le genre est obligatoire"})}
                            className="rounded px-3 py-2 w-full bg-white border "
                        >
                            <option disabled hidden>
                                Select an option
                            </option>
                            <option value="man">Man</option>
                            <option value="woman">Woman</option>
                            <option value="non_binary">Non-binary</option>
                        </select>
                        {errors.kind && <p className="bg-red-600 text-white text-sm mt-1">{errors.kind.message}</p>}
                        <label className="text-sm font-semibold text-gray-700">
                            Sexual Orientation
                        </label>
                        <select
                            {...register("orientation", {required: "L'orientation sexuelle est obligatoire"})}
                            className="rounded px-3 py-2 w-full bg-white border "
                        >
                            <option disabled hidden>
                                Select an option
                            </option>
                            <option value="Men">Men</option>
                            <option value="Woman">Weman</option>
                            <option value="All">All</option>
                        </select>
                        {errors.orientation && <p className="bg-red-600 text-white text-sm mt-1">{errors.orientation.message}</p>}
                        <label className="text-sm font-semibold text-gray-700">
                            Biography
                        </label>
                        <input
                            type="text"
                            placeholder="j'aime les fleures ......"
                            {...register("biography")}
                            className="rounded  px-3 py-2 w-full bg-white border "
                        />
                    </div>
                    {invalide && <p className="bg-red-600 text-white font-bold px-3 py-1 rounded-lg">{invalide}</p>}
                    <button 
                        type= "submit"
                        disabled={isSumit}
                        className="bg-blue-950 text-white rounded p-2 mt-4"
                    >
                        {isSumit ? "Connexion..." : "Submit"}
                    </button>
                </form>
            </div>
            <Footer/>
        </Bottom>
    )
}
