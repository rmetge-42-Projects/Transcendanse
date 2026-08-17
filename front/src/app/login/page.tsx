	
'use client';
import Bottom from "../../display/bottom";
import Footer from "@/src/display/footer";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from 'react-hook-form';
import { api } from '@/src/lib/axios';
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
			router.push("/profile");
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
		<Bottom>
			<div className="w-full px-6 border-gray-200 py-4">
				<Link 
					href="/" 
					className="text-sm text-gray-600 hover:text-black flex items-center gap-1 transition"
				>
					← Retour à l'accueil
				</Link>
			</div>
	
			<div className="bg-white flex flex-col items-center p-8 rounded-xl shadow-lg w-full max-w-md mx-auto my-auto">
				<h1 className="text-center text-2xl font-bold text-blue-950 mb-6">Se connecter</h1>
				
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
					{/* <div>
						<label className="block mb-1">Password</label>
						<input 
							type="password" 
							placeholder="ex: Password.123" 
							{...register('password', { required: 'Le mot de passe est obligatoire' })}
							className="rounded px-3 py-2 w-full border"
						/>
						{errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
					</div> */}

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
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12c1.274 4.057 5.065 7 9.964 7 4.899 0 8.69-2.943 9.964-7-1.274-4.057-5.065-7-9.964-7-4.899 0-8.69 2.943-9.964 7z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
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
			</div>
			<Footer/>
		</Bottom>
	);
}