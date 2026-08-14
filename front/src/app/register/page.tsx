'use client'
import Bottom from "@/src/display/bottom"
import Link from "next/link"
import { useRouter } from "next/navigation";
import { useState } from "react";
import Footer from "@/src/display/footer";
import { useForm } from 'react-hook-form';
import { api } from '@/src/lib/axios';
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
			const res = await api.post("/auth/register", data)
			localStorage.setItem("token", res.data.access_token)
			router.push("/createProfile");
		}
		catch{
				setInvalide("Email ou mot de passe incorrect.");
				reset();
		}
		finally{
			setIsLoading(false);
		}
	}
	return(
		<Bottom>
			<div className="w-full px-6 border-gray-200 py-4">
				<Link 
					href="/" 
					className="text-sm text-gray-600 hover:text-black flex items-center gap-1 transition"
				>
					← Retour à l'accueil
				</Link>
			</div>

			<div className="bg-white p-8 flex flex-col items-center rounded-xl shadow-lg w-full max-w-md max-w-2xl mx-auto my-auto">
				<h1 className="text-center text-2xl font-bold text-blue-950 mb-6">Create Account</h1>
				<form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
					<label>Email</label>
					<input 
						type="email" 
						placeholder="ex: test@test.com" 
						{...register("email", {required: "L\'email est obligatoire"})}
						className="rounded px-3 py-2 w-full border "
					/>
					{errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
					<label>Password</label>
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
					<label>Validate password</label>
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
					{errors.validatePassword && <p className="text-red-500 text-sm mt-1">{errors.validatePassword.message}</p>}
					{invalide && <p className="text-red-500">{invalide}</p>}
					<button 
						type="submit"
						disabled={isLoading}
						className="bg-blue-600 text-white rounded p-2 mt-4"
					>
						{isLoading ? "Connexion..." : "Submit"}
					</button>
				</form>
				<button 
					className="bg-gray-600 text-white rounded p-2 mt-4" 
					onClick={loginRedirect}
				>
					Back to login
				</button>
			</div>
			<Footer/>
		</Bottom>
	)
}