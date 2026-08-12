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
					<input 
						type="password" 
						placeholder="ex: Password.123" 
						{...register("password", {required: "Le mot de passe est obligatoire"})}
						className="rounded px-3 py-2 w-full border "
					/>
					{errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
					<label>Validate password</label>
					<input 
						type="password" 
						placeholder="ex: Password.123"
						{...register("validatePassword", {required: "La validation de mot de passe est obligatoire"})} 
						className="rounded px-3 py-2 w-full border "
					/>
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