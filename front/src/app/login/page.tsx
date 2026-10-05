	
'use client';
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from 'react-hook-form';
import { api } from '@/src/lib/axios';
import { Eye, EyeOff } from "lucide-react";
import Connextion from "@/src/composant/connection/connection";
//page de connection

// 1. Définition du type pour le formulaire
type LoginFormValues = {
	email: string;
	password: string;
};

export default function Login() {
	const router = useRouter();
	const [invalide, setInvalide] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	
	// 2. Configuration de React Hook Form
	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<LoginFormValues>();

	// 4. Fonction déclenchée uniquement si les règles de validation sont respectées
	const onSubmit = async (data: LoginFormValues) => {
		setInvalide(''); 
		// On bloque le bouton
		setIsLoading(true);
		try{
			const res = await api.post("/auth/login", data);
			localStorage.setItem('token', res.data.access_token);
			router.push("/myProfile");
		}
		catch {
			setInvalide("Email ou mot de passe incorrect.");
			reset();
		}
		finally{
			setIsLoading(false);
		}
	};

	const registerRedirect = () => {
		router.push("/register");
	};

	return (
		<Connextion title="Se connecter" >
				{/* On enveloppe onSubmit dans handleSubmit */}
				<form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 w-full">
					<div>
						<label className="block mb-1">Email</label>
						<input 
							type="email" 
							placeholder="ex: test@test.com" 
							{...register('email', { required: 'L\'email est obligatoire' })}
							className="rounded px-3 py-2 w-full border"
							/>
						{errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
					</div>
	
					<div>
						<label className="block mb-1 text-sm font-semibold text-gray-700">Mot de passe</label>
	
						{/* Conteneur relative indispensable pour caler le bouton */}
						<div className="relative w-full">
							<input 
								type={showPassword ? 'text' : 'password'}
								placeholder="ex: Password.123" 
								{...register('password', { required: 'Le mot de passe est obligatoire' })}
								className="rounded px-3 py-2 pr-10 w-full border border-gray-300"
								/>

								<button
								type="button"
								onClick={() => setShowPassword(!showPassword)}
								className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer rounded-full focus:outline-none"
								aria-label={showPassword ? "Masquer" : "Afficher"}
								>
								{showPassword ? (
									<EyeOff />
								) : (
									<Eye />
								)}
							</button>
						</div>
					{errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
					</div>
					{invalide && <p className="text-red-500 text-sm">{invalide}</p>}
					<button 
						type="submit" 
						disabled={isLoading}
						className="bg-blue-600 hover:bg-blue-700 text-white rounded p-2 mt-4 transition disabled:bg-blue-300"
						>
						{isLoading ? 'Connexion...' : 'Se connecter'}
					</button>
				</form>
				<button 
					className="bg-gray-600 hover:bg-gray-700 text-white rounded p-2 mt-4 w-full transition" 
					onClick={registerRedirect}
					>
					S'inscrire
				</button>
							
		</Connextion>
	);
}