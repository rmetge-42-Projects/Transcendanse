'use client'
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from 'react-hook-form';
import { api } from '@/src/lib/axios';
import { Eye, EyeOff } from "lucide-react";
import Connextion from "@/src/composant/connection/connection";
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
			localStorage.setItem("token", res.data.access_token)
			router.push("/createProfile");
		}

		catch (error: any) {
		  // 1. Récupération du message d'erreur renvoyé par le backend
		  const serverMessage = error.response?.data?.message;

		  let errorMessage = "Une erreur est survenue lors de l'inscription.";

		  // 2. Gestion si NestJS renvoie plusieurs erreurs de validation (tableau) ou un message simple (string)
		  if (Array.isArray(serverMessage)) {
		    errorMessage = serverMessage.join(". "); // Fusionne les erreurs en une seule phrase
		  } else if (typeof serverMessage === "string") {
		    errorMessage = serverMessage;
		  }
	  
		  // 3. Mise à jour de ton état d'erreur
		  setInvalide(errorMessage);
		  reset();
		}
		// catch{
		
		// 	// setInvalide("Email ou mot de passe incorrect.");
		// 	reset();
		// }
		finally{
			setIsLoading(false);
		}
	}
	return(
		<Connextion title="S'inscrire" >
				<form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
					<label>Email</label>
					<input 
						type="email" 
						placeholder="ex: test@test.com" 
						{...register("email", {required: "L\'email est obligatoire"})}
						className="rounded px-3 py-2 w-full border "
						/>
					{errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
					<label>Mot de passe</label>
					<div className="relative w-full">
						<input 
							// type="password" 
							
							type={showPassword ? 'text' : 'password'}
							placeholder="ex: Password.123" 
							{...register("password", {required: "Le mot de passe est obligatoire"})}
							className="rounded px-3 py-2 w-full border "
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
					<label>Validation mot de passe</label>
					<div className="relative w-full">

						<input 
							// type="password" 
							type={showVerifPassword ? 'text' : 'password'}
							placeholder="ex: Password.123"
							{...register("validatePassword", {required: "La validation de mot de passe est obligatoire"})} 
							className="rounded px-3 py-2 w-full border "
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