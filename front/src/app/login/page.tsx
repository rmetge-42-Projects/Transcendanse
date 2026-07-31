// 'use client'
// import Bottom from "../../component/display/bottom"
// import Footer from "@/src/component/footer"
// import Link from "next/link"
// import { useState } from "react"
// import { useRouter } from "next/navigation"
// //page de connection

// export default function Login()
// {
// 	const router = useRouter();
// 	const [invalide, setInvalide] = useState('');
// 	function register(){
// 		router.push("/register")
// 	}
// 	async function submit(e : React.FormEvent<HTMLFormElement>)
// 	{
// 		e.preventDefault();
// 		if (!email.trim() || !password.trim()) {
// 			setInvalide('Veuillez remplir tous les champs obligatoires.');
// 			return; // ⛔ ON S'ARRÊTE ICI ! La requête ne partira pas au back.
// 		}
// 		// 2. Si tout est OK, on efface l'erreur et on envoie au Back-end (NestJS)
// 		setInvalide('');
// 		// console.log({email, password});
// 		try {
// 			const reponse = await(fetch('http://localhost:4000/auth/login', {
// 				method: 'POST',
// 				headers: {
// 				'Content-Type': 'application/json',
// 				},
// 				body: JSON.stringify({ email, password })}));
// 			const data = await(reponse.json());
// 			console.log(data);
// 			if (data.success === true)
// 			{
// 				localStorage.setItem('token', data.access_token);
// 				router.push("/profile");
// 			}
// 			else 
// 			{
// 				setInvalide("Email ou mot de passe incorrect.");
// 				setEmail('');
// 				setPassword('');
// 			}
// 		}
// 		catch(error)
// 		{
// 			console.error("error de connextion : ", error);
// 		}
// 	}
// 	const [email, setEmail] = useState('');
// 	const [password, setPassword] = useState('');
// 	return(
// 		<Bottom>
// 			<div className="w-full px-6  border-gray-200 py-4">
// 				<Link 
// 					href="/" 
// 					className="text-sm text-gray-600 hover:text-black flex items-center gap-1 transition"
// 				>
// 					← Retour à l'accueil
// 				</Link>
// 			</div>
	
// 			<div className="bg-white flex flex-col items-center p-8 rounded-xl shadow-lg w-full max-w-md max-w-2xl mx-auto my-auto">
// 				<h1 className="text-center text-2xl font-bold text-blue-950 mb-6">Login</h1>
// 				<form onSubmit={submit} className="flex flex-col gap-4">
// 					<label>Email</label>
// 					<input type="email" placeholder="ex: test@test.com" value={email} onChange={(e) => setEmail(e.target.value)} className="rounded px-3 py-2 w-full border "/>
// 					<label>Password</label>
// 					<input type="password" placeholder="ex: Password.123" value={password} onChange={(e) => setPassword(e.target.value)} className="rounded px-3 py-2 w-full border "/>
// 					{invalide && <p className="text-red-500">{invalide}</p>}
// 					<button className="bg-blue-600 text-white rounded p-2 mt-4">Login</button>
// 				</form>
// 				<button className="bg-gray-600 text-white rounded p-2 mt-4" onClick={register}>Create new account</button>
// 			</div>
// 			<Footer/>
// 		</Bottom>
// 	)
// }	

'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/src/lib/axios'; // Ton instance Axios créée à l'Étape 2
import Bottom from '@/src/component/display/bottom'; // Ajuste tes imports si besoin
import Footer from '@/src/component/footer'; // Ajuste tes imports si besoin

// 1. Définition du type pour TypeScript
type LoginFormValues = {
	email: string;
	password: string;
};
export default function Login() {
	const router = useRouter();
	const [invalide, setInvalide] = useState('');
	
	// 2. React Hook Form : plus besoin de useState pour email/password !
	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<LoginFormValues>();
	
	// 3. React Query + Axios : Gestion de la requête POST
	const loginMutation = useMutation({
		mutationFn: async (credentials: LoginFormValues) => {
		// Axios remplace fetch() : pas besoin de JSON.stringify ni de headers
		const response = await api.post('/auth/login', credentials);
		return response.data;
		},
		onSuccess: (data) => {
		// Ce bloc s'exécute si le backend renvoie un statut 2xx
		if (data.success === true) {
			localStorage.setItem('token', data.access_token);
			router.push('/profile');
		} else {
			setInvalide('Email ou mot de passe incorrect.');
			reset();
		}
		},
		onError: (error: any) => {
			// Ce bloc s'exécute automatiquement si NestJS renvoie une erreur (400, 401, 500, etc.)
			console.error('Erreur de connexion :', error);
			const message = error.response?.data?.message || 'Email ou mot de passe incorrect.';
			setInvalide(Array.isArray(message) ? message[0] : message);
			reset(); // Réinitialise les champs
		},
	});
	
	// 4. Fonction de soumission appelée par React Hook Form si les champs sont valides
	const onSubmit = (data: LoginFormValues) => {
		setInvalide('');
		loginMutation.mutate(data); // Déclenche la mutation React Query
	};
	function registerRedirect() {
		router.push('/register');
	}
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
			<h1 className="text-center text-2xl font-bold text-blue-950 mb-6">Login</h1>
			{/* handleSubmit valide d'abord les règles avant d'exécuter onSubmit */}
			<form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 w-full">
			<div>
				<label className="block mb-1">Email</label>
				<input
				type="email"
				placeholder="ex: test@test.com"
				{...register('email', { required: 'L\'email est obligatoire.' })}
				className="rounded px-3 py-2 w-full border"
				/>
				{errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
			</div>
			<div>
				<label className="block mb-1">Password</label>
				<input
				type="password"
				placeholder="ex: Password.123"
				{...register('password', { required: 'Le mot de passe est obligatoire.' })}
				className="rounded px-3 py-2 w-full border"
				/>
				{errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
			</div>
			{/* Affichage des erreurs retournées par le serveur */}
			{invalide && <p className="text-red-500 text-sm">{invalide}</p>}
			{/* Le bouton se désactive automatiquement pendant que la requête s'exécute */}
			<button
				type="submit"
				disabled={loginMutation.isPending}
				className="bg-blue-600 hover:bg-blue-700 text-white rounded p-2 mt-4 transition disabled:bg-blue-300"
			>
				{loginMutation.isPending ? 'Connexion...' : 'Login'}
			</button>
			</form>
			<button
			className="bg-gray-600 hover:bg-gray-700 text-white rounded p-2 mt-4 w-full transition"
			onClick={registerRedirect}
			>
			Create new account
			</button>
		</div>
		<Footer />
		</Bottom>
	);	
}	