'use client'
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from 'react-hook-form';
import { api } from '@/src/lib/axios';
import { Eye, EyeOff } from "lucide-react";
import Connextion from "@/src/composant/connection/connection";
import { getErrorMessage } from "@/src/lib/errors";
import { setAuthToken } from "@/src/lib/authToken";

//page register pour cree son compte

type	RegisterFormValues = {
	email: string;
	password: string;
	validatePassword: string;
}

export default function NewAccount(){
	const	router = useRouter();
	const	[invalide, setInvalide] = useState('');
	const	[isLoading, setIsLoading] = useState(false);
	const	[showPassword, setShowPassword] = useState(false);
	const	[showVerifPassword, setShowVerifPassword] = useState(false);

	const {
			register,
			handleSubmit,
			reset,
			formState: { errors },
	} = useForm<RegisterFormValues>();

	function loginRedirect(){
		router.push("/login")
	}
	
	
	const	onSubmit = async (data: RegisterFormValues) =>
	{
		setInvalide('');
		setIsLoading(true);
		data.email;
		data.password;
		data.validatePassword;

		try {
				console.log("tst");
				const res = await api.post("/auth/register", data)
				setAuthToken(res.data.access_token)
				router.push("/createProfile");
		}
		catch (error: any) {
			setInvalide(getErrorMessage(error, "Une erreur est survenue lors de l'inscription."));
		}
		finally{
			setIsLoading(false);
		}
	}
	return(
		<Connextion title="S'inscrire" >
				<form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
					<label className="block mb-1 text-sm font-semibold text-gray-700">Email</label>
					<input 
						type="email" 
						placeholder="ex: test@test.com" 
						{...register("email", {required: "L\'email est obligatoire"})}
						className="rounded px-3 py-2 w-full border text-black "
						/>
					{errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
					<label className="block mb-1 text-sm font-semibold text-gray-700">Mot de passe</label>
					<div className="relative w-full">
						<input 
							// type="password" 
							
							type={showPassword ? 'text' : 'password'}
							placeholder="ex: Password.123" 
							{...register("password", {required: "Le mot de passe est obligatoire"})}
							className="rounded px-3 py-2 w-full border text-black "
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
					<label className="block mb-1 text-sm font-semibold text-gray-700">Validation mot de passe</label>
					<div className="relative w-full">

						<input 
							// type="password" 
							type={showVerifPassword ? 'text' : 'password'}
							placeholder="ex: Password.123"
							{...register("validatePassword", {required: "La validation de mot de passe est obligatoire"})} 
							className="rounded px-3 py-2 w-full border text-black "
							/>
						<button
                    	    type="button"
                    	    onClick={() => setShowVerifPassword(!showVerifPassword)}
                    	    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer rounded-full focus:outline-none"
                    	    aria-label={showVerifPassword ? "Masquer" : "Afficher"}
							>
                    	    {showVerifPassword ? (
								<EyeOff />
                    	    ) : (
								<Eye />
                    	    )}
                    	</button>
					</div>
					{errors.validatePassword && <p className="text-red-500 text-sm mt-1">{errors.validatePassword.message}</p>}
					{invalide && <p className="text-red-500">{invalide}</p>}
					<button 
						type="submit"
						disabled={isLoading}
						className="bg-blue-600 text-white rounded p-2 mt-4"
						>
						{isLoading ? "Connexion..." : "S'inscrire"}
					</button>
				</form>
				<button 
					className="bg-gray-600 text-white rounded p-2 mt-4" 
					onClick={loginRedirect}
					>
					J'ai deja un compte
				</button>
		</Connextion>
	)
}
