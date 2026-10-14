	
'use client';
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from 'react-hook-form';
import { api } from '@/src/lib/axios';
import { Eye, EyeOff } from "lucide-react";
import Connextion from "@/src/composant/connection/connection";
import { socket } from "@/src/lib/socket";
import { getErrorMessage } from "@/src/lib/errors";
import { setAuthToken } from "@/src/lib/authToken";
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
	
	// États pour gérer la 2FA
    const [requires2FA, setRequires2FA] = useState(false);
    const [emailFor2FA, setEmailFor2FA] = useState('');
    const [twoFactorToken, setTwoFactorToken] = useState('');


	// 2. Configuration de React Hook Form
	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<LoginFormValues>();


	// Fonction centralisée pour finaliser la connexion une fois le JWT obtenu
    const handleLoginSuccess = (token: string) => {
        setAuthToken(token);
        socket.auth = { token };

        if (socket.connected) {
            socket.disconnect();
        }
        socket.connect();

        router.push("/myProfile");
    };

	const onSubmit = async (data: LoginFormValues) => {
		setInvalide(''); 
		setIsLoading(true);
		try{
			const res = await api.post("/auth/login", data);
            if (res.data.message === "2FA required" || res.data.success === false) {
                setEmailFor2FA(data.email);
                setRequires2FA(true);
                return;
            }

            if (res.data.access_token) {
                handleLoginSuccess(res.data.access_token);
            }
        } 
        catch (error) {
            
            setInvalide(getErrorMessage(error, "Une erreur est survenue, réessayez."));
            // reset();
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerify2FA = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!twoFactorToken || twoFactorToken.length < 6) return;

        setInvalide('');
        setIsLoading(true);

        try {
            const res = await api.post("/auth/2fa/verify-login", {
                email: emailFor2FA,
                token: twoFactorToken,
            });

            if (res.data.access_token) {
                handleLoginSuccess(res.data.access_token);
            }
        } 
		catch (error) {
            setInvalide(getErrorMessage(error, "Code 2FA invalide ou expiré."));
        } 
		finally {
            setIsLoading(false);
        }
    };

	const registerRedirect = () => {
		router.push("/register");
	};

	return (
    <Connextion title={requires2FA ? "Double authentification" : "Se connecter"}>
        {!requires2FA ? (
            /* --- FORMULAIRE CONNEXION CLASSIQUE --- */
            <>
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 w-full">
                    <div>
                        <label className="block mb-1 text-sm font-semibold text-gray-700">Email</label>
                        <input 
                            type="email" 
                            placeholder="ex: test@test.com" 
                            {...register('email', { required: 'L\'email est obligatoire' })}
                            className="rounded px-3 py-2 w-full border text-black "
                        />
                        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                    </div>

                    <div>
                        <label className="block mb-1 text-sm font-semibold text-gray-700">Mot de passe</label>

                        <div className="relative w-full">
                            <input 
                                type={showPassword ? 'text' : 'password'}
                                placeholder="ex: Password.123" 
                                {...register('password', { required: 'Le mot de passe est obligatoire' })}
                                className="rounded px-3 py-2 w-full border text-black "
                            />

                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer rounded-full focus:outline-none"
                                aria-label={showPassword ? "Masquer" : "Afficher"}
                            >
                                {showPassword ? <EyeOff /> : <Eye />}
                            </button>
                        </div>
                        {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
                    </div>

                    {invalide && <p className="text-red-500 text-sm">{invalide}</p>}

                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className="bg-blue-600 hover:bg-blue-700 text-white rounded p-2 mt-4 transition disabled:bg-blue-300 cursor-pointer"
                    >
                        {isLoading ? 'Connexion...' : 'Se connecter'}
                    </button>
                </form>

                <button 
                    className="bg-gray-600 hover:bg-gray-700 text-white rounded p-2 mt-4 w-full transition cursor-pointer" 
                    onClick={registerRedirect}
                >
                    S'inscrire
                </button>
            </>
        ) : (
            /* --- FORMULAIRE CODE 2FA --- */
            <form onSubmit={handleVerify2FA} className="flex flex-col gap-4 w-full">
                <p className="text-sm text-gray-600 text-center">
                    Entrez le code à 6 chiffres généré par votre application d'authentification.
                </p>

                <div>
                    <input 
                        type="text" 
                        maxLength={6}
                        placeholder="123456" 
                        value={twoFactorToken}
                        onChange={(e) => setTwoFactorToken(e.target.value)}
                        className="rounded px-3 py-2 w-full border text-center text-xl font-mono tracking-widest"
                        autoFocus
                    />
                </div>

                {invalide && <p className="text-red-500 text-sm text-center">{invalide}</p>}

                <button 
                    type="submit" 
                    disabled={isLoading || twoFactorToken.length < 6}
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded p-2 mt-2 transition disabled:bg-blue-300 cursor-pointer"
                >
                    {isLoading ? 'Vérification...' : 'Valider le code'}
                </button>

                <button 
                    type="button" 
                    onClick={() => {
                        setRequires2FA(false);
                        setTwoFactorToken('');
                        setInvalide('');
                    }}
                    className="text-sm text-gray-500 hover:underline text-center mt-2 cursor-pointer"
                >
                    ← Retour à la connexion
                </button>
            </form>
        )}
    </Connextion>
	);
}
