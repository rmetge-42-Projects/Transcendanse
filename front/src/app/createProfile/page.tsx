'use client'
import Bottom from "@/src/display/bottom"
import Footer from "@/src/display/footer"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from 'react-hook-form';
import { api } from '@/src/lib/axios';
//page de creation de compte où on rentre toute les info personnel

type ProfileFormValues = {
	name: string;
	username: string;
	birthday: Date;
	kind: string;
	orientation: string;
	biography: string;
};

export  default function CreateAccount()
{
	const router = useRouter();
	const [invalide, setInvalide] = useState('');
	const [isSumit, setIsSumbit] = useState(false);
	const today = new Date().toISOString().split("T")[0];

	// // 1. On crée la date d'aujourd'hui
	// const maxDateObj = new Date();
	// // 2. On retire 18 ans à l'année actuelle
	// maxDateObj.setFullYear(maxDateObj.getFullYear() - 18);
	// // 3. On formate au format YYYY-MM-DD
	// const dateMin = maxDateObj.toISOString().split("T")[0];


	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<ProfileFormValues>();

	const onSubmit = async (data: ProfileFormValues) => 
	{
		setInvalide('');
		setIsSumbit(true);
		try {
			const res = await api.post("/users/createProfile", data);
			router.push("/profile");
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
					Creation du profile
				</h1>
				<form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md mx-auto flex flex-col gap-4 mt-6">
					<p className="text-black mt-2  text-center">
						Remplis tes informations pour personnaliser ton compte.
					</p>
					<div className="flex flex-col gap-2">
						<label className="text-sm font-semibold text-gray-700">
							Nom
						</label>
						<input
							type="text"
							placeholder="ex: alexendre"
							{...register("name", {required: "Le nom est obligatoire"})}
							className="rounded  px-3 py-2 w-full bg-white border "
						/>
						{errors.name && <p className="bg-red-600 text-white text-sm mt-1">{errors.name.message}</p>}
						<label 
							className="text-sm font-semibold text-gray-700">
							Nom d'utilisateur
						</label>
						<input
							type="text"
							placeholder="ex: alex_dev"
							{...register("username", {required: "Le nom d'utilisateur est obligatoire"})}
							className="rounded px-3 py-2 w-full bg-white border "
						/>
						{errors.username && <p className="bg-red-600 text-white text-sm mt-1">{errors.username.message}</p>}
						<label className="text-sm font-semibold text-gray-700">
							Date de naissance
						</label>
						<input
							type="date"
							max={today}
							{...register("birthday", {required: "La date d'anniversaire est obligatoire"})}
							className="rounded px-3 py-2 w-full bg-white border "
						/>
						{errors.birthday && <p className="bg-red-600 text-white text-sm mt-1">{errors.birthday.message}</p>}
						<label className="text-sm font-semibold text-gray-700">
							Genre
						</label>
						<select
							{...register("kind", {required: "Le genre est obligatoire"})}
							className="rounded px-3 py-2 w-full bg-white border "
						>
							<option disabled hidden>
								Choisi une option
							</option>
							<option value="man">Homme</option>
							<option value="woman">Femme</option>
							<option value="non_binary">Non-binaire</option>
						</select>
						{errors.kind && <p className="bg-red-600 text-white text-sm mt-1">{errors.kind.message}</p>}
						<label className="text-sm font-semibold text-gray-700">
							Orientation sexuelle
						</label>
						<select
							{...register("orientation", {required: "L'orientation sexuelle est obligatoire"})}
							className="rounded px-3 py-2 w-full bg-white border "
						>
							<option disabled hidden>
								Choisi une option
							</option>
							<option value="Men">Homme</option>
							<option value="Woman">Femme</option>
							<option value="All">N'importe</option>
						</select>
						{errors.orientation && <p className="bg-red-600 text-white text-sm mt-1">{errors.orientation.message}</p>}
						<label className="text-sm font-semibold text-gray-700">
							Biographie
						</label>
						<textarea
							rows={3}
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
						{isSumit ? "Connexion..." : "Connexion"}
					</button>
				</form>
			</div>
			<Footer/>
		</Bottom>
	)
}
