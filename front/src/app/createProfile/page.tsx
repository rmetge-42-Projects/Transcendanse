'use client';
import Bottom from "@/src/display/bottom";
import Footer from "@/src/display/footer";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from 'react-hook-form';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '@/src/lib/axios';
import AvatarPicker from "@/src/composant/profile/AvatarPicker";
// import { getErrorMessage } from "@/src/constant/getErrorMessage";
import { getErrorMessage } from "@/src/lib/errors";
//page de creation de compte où on rentre toute les info personnel

type ProfileFormValues = {
	name: string;
	username: string;
	birthday: Date;
	kind: string;
	orientation: string;
	biography: string;
};

export default function CreateAccount() {
	const router = useRouter();
	const queryClient = useQueryClient();
	const [invalide, setInvalide] = useState('');
	const [isSubmit, setIsSubmit] = useState(false);
	const [preview, setPreview] = useState<string | null>(null);

	// Date maximum (18 ans minimum)
	const maxDateObj = new Date();
	maxDateObj.setFullYear(maxDateObj.getFullYear() - 18);
	const dateMin = maxDateObj.toISOString().split("T")[0];

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<ProfileFormValues>();

	const handlePhotoChange = (_file: File | null, dataUrl: string | null) => {
		setPreview(dataUrl);
	};

	const onSubmit = async (data: ProfileFormValues) => {
		setInvalide('');
		setIsSubmit(true);
		try {
			const payload = {
				name: data.name,
				username: data.username,
				birthday: new Date(data.birthday),
				kind: data.kind,
				orientation: data.orientation,
				biography: data.biography || '',
				photo: preview || null,
			};

			await api.post('/users/createProfile', payload);
			await queryClient.invalidateQueries({ queryKey: ['userMe'] });
			router.push('/myProfile');
		}
		catch (err: any) {
			setInvalide(getErrorMessage(err, "Erreur lors de l'enregistrement du profil. Veuillez réessayer."));
		}
		finally {
			setIsSubmit(false);
		}
	};

	return (
		<Bottom>
			<div className="flex flex-col items-center justify-center min-h-[70vh] px-4 py-8">
				<h1 className="text-blue-950 text-3xl md:text-5xl font-black text-center">
					Création du profil
				</h1>
				<form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md mx-auto flex flex-col gap-4 mt-6">
					<p className="text-gray-600 text-sm text-center">
						Remplis tes informations pour personnaliser ton compte.
					</p>

					<div className="flex flex-col gap-3">
						{/* CHAMP PHOTO AVEC BOUTON ET MENU D'OPTIONS */}
						<div className="flex justify-center mb-2">
							<AvatarPicker
								value={preview}
								onChange={handlePhotoChange}
							/>
						</div>

						{/* NOM */}
						<div>
							<label className="text-sm font-semibold text-gray-700 block mb-1">
								Nom
							</label>
							<input
								type="text"
								placeholder="ex: Alexandre"
								{...register("name", { required: "Le nom est obligatoire" })}
								className="rounded-lg px-3.5 py-2 w-full bg-white border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
							/>
							{errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
						</div>

						{/* NOM D'UTILISATEUR */}
						<div>
							<label className="text-sm font-semibold text-gray-700 block mb-1">
								Nom d'utilisateur
							</label>
							<input
								type="text"
								placeholder="ex: alex_dev"
								{...register("username", { required: "Le nom d'utilisateur est obligatoire" })}
								className="rounded-lg px-3.5 py-2 w-full bg-white border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
							/>
							{errors.username && <p className="text-red-500 text-xs mt-1">{errors.username.message}</p>}
						</div>

						{/* DATE DE NAISSANCE */}
						<div>
							<label className="text-sm font-semibold text-gray-700 block mb-1">
								Date de naissance
							</label>
							<input
								type="date"
								max={dateMin}
								{...register("birthday", { required: "La date de naissance est obligatoire" })}
								className="rounded-lg px-3.5 py-2 w-full bg-white border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
							/>
							{errors.birthday && <p className="text-red-500 text-xs mt-1">{errors.birthday.message}</p>}
						</div>

						{/* GENRE */}
						<div>
							<label className="text-sm font-semibold text-gray-700 block mb-1">
								Genre
							</label>
							<select
								defaultValue=""
								{...register("kind", { required: "Le genre est obligatoire" })}
								className="rounded-lg px-3.5 py-2 w-full bg-white border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
							>
								<option value="" disabled hidden>
									Choisis une option
								</option>
								<option value="man">Homme</option>
								<option value="woman">Femme</option>
								<option value="non_binary">Non-binaire</option>
							</select>
							{errors.kind && <p className="text-red-500 text-xs mt-1">{errors.kind.message}</p>}
						</div>

						{/* ORIENTATION SEXUELLE */}
						<div>
							<label className="text-sm font-semibold text-gray-700 block mb-1">
								Orientation sexuelle
							</label>
							<select
								defaultValue=""
								{...register("orientation", { required: "L'orientation sexuelle est obligatoire" })}
								className="rounded-lg px-3.5 py-2 w-full bg-white border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
							>
								<option value="" disabled hidden>
									Choisis une option
								</option>
								<option value="man">Homme</option>
								<option value="woman">Femme</option>
								<option value="all">N'importe</option>
							</select>
							{errors.orientation && <p className="text-red-500 text-xs mt-1">{errors.orientation.message}</p>}
						</div>

						{/* BIOGRAPHIE */}
						<div>
							<label className="text-sm font-semibold text-gray-700 block mb-1">
								Biographie
							</label>
							<textarea
								rows={3}
								placeholder="Passionné(e) de danse, voyages..."
								{...register("biography")}
								className="rounded-lg px-3.5 py-2 w-full bg-white border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900 resize-none"
							/>
						</div>
					</div>

					{invalide && (
						<div className="bg-red-50 text-red-700 border border-red-200 px-4 py-2.5 rounded-lg text-sm font-medium">
							{invalide}
						</div>
					)}

					<button 
						type="submit"
						disabled={isSubmit}
						className="bg-blue-950 hover:bg-blue-900 text-white font-medium rounded-lg p-3 mt-2 transition cursor-pointer disabled:bg-gray-400"
					>
						{isSubmit ? "Enregistrement en cours..." : "Valider mon profil"}
					</button>
				</form>
			</div>
			<Footer/>
		</Bottom>
	);
}
