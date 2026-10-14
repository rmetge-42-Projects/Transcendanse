'use client'
import { FileText, Settings, UserPen, Lock, ShieldCheck, X } from "lucide-react"
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/src/lib/axios";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { clearAuthToken } from "@/src/lib/authToken";

export default function Menu()
{
	const router = useRouter();
	const queryClient = useQueryClient();
	const [isOpen, setIsOpen] = useState(false);

	const [is2FAEnabled, setIs2FAEnabled] = useState(false);

	const [showModal, setShowModal] = useState(false);
    const [qrCodeImage, setQrCodeImage] = useState<string | null>(null);
    const [token, setToken] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

	function menu() {
  	  setIsOpen(!isOpen);
  	}

	useEffect(() => {
        const fetchUserStatus = async () => {
            try {
                const response = await api.get('/users/me'); // Ajuste l'endpoint
                setIs2FAEnabled(response.data.twoFactorEnabled || false);
            } catch (e) {
                console.error("Erreur lors de la récupération des infos utilisateur", e);
            }
        };
        fetchUserStatus();
    }, []);


	// Clic sur la case à cocher
    const handleToggle2FA = async () => {
        if (!is2FAEnabled) {
            try {
                setLoading(true);
                setError("");
                const response = await api.post('/auth/2fa/generate');
                
                setQrCodeImage(response.data.qrCodeImage); 
                setShowModal(true);                       
            } catch (err) {
                console.error("Erreur génération 2FA", err);
                alert("Impossible de générer le QR Code.");
            } finally {
                setLoading(false);
            }
        } else {
            const confirmDisable = window.confirm("Veux-tu vraiment désactiver la double authentification ?");
            if (!confirmDisable) return;

            try {
                await api.post('/auth/2fa/disable');
                setIs2FAEnabled(false);
            } catch (err) {
                console.error("Erreur désactivation 2FA", err);
                alert("Erreur lors de la désactivation.");
            }
        }
    };


    const handleConfirm2FA = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token || token.length < 6) return;

        try {
            setLoading(true);
            setError("");

            await api.post('/auth/2fa/confirm', { token });

            setIs2FAEnabled(true);
            setShowModal(false);
            setToken("");
            setQrCodeImage(null);
            alert("Double authentification activée avec succès !");
        } catch (err) {
            console.error("Code 2FA invalide", err);
            setError("Code invalide. Vérifie ton application et réessaie.");
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        const confirmLogout = window.confirm("Es-tu sûr de vouloir te déconnecter ?");
        if (!confirmLogout) return;
        try {
            await api.patch('/users/status', { isOnline: false });
        } catch (e) {
            console.error("Erreur lors de la déconnexion", e);
        } finally {
            clearAuthToken();
            queryClient.clear();
            router.push('/');
        }
    };

	return(
		<div className="absolute top-4 right-6 z-50">
			<button 
				onClick={menu}
				className="p-3 rounded-2xl bg-white border border-gray-200 shadow-sm hover:bg-gray-50 transition-all cursor-pointer text-gray-700 flex items-center justify-center"
				aria-label="Settings"
			>
				<Settings />
			</button>
			{isOpen && (
				<div className="absolute right-0 mt-3 w-56 bg-white border border-gray-200 rounded-2xl shadow-2xl z-50 p-2 flex flex-col gap-1 text-base">
					<Link 
						href="/modifyProfile"
						className="px-4 py-3 rounded-xl hover:bg-gray-100 font-semibold text-gray-800 transition-colors flex items-center gap-3"
						>
						<UserPen/>
						Modifier le profil
					</Link>
					<Link 
						href="/privacy"
						className="px-4 py-3 rounded-xl hover:bg-gray-100 font-semibold text-gray-800 transition-colors flex items-center gap-3"
					>
						<Lock/>
						Politique de confidentialité
					</Link>
					<Link
						href="/terms"
						className="px-4 py-3 rounded-xl hover:bg-gray-100 font-semibold text-gray-800 transition-colors flex items-center gap-3"
					>
						<FileText/>
						Conditions d’utilisation
					</Link>

					<label className="px-4 py-3 rounded-xl hover:bg-gray-100 font-semibold text-gray-800 transition-colors flex items-center justify-between cursor-pointer select-none">
                        <div className="flex items-center gap-3">
                            <ShieldCheck />
                            <span>Double 2FA</span>
                        </div>
                        <input 
                            type="checkbox" 
                            checked={is2FAEnabled}
                            onChange={handleToggle2FA}
                            disabled={loading}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                        />
                    </label>

					<button
						onClick={logout}
						className="w-full text-left px-4 py-3 rounded-xl hover:bg-red-50 font-semibold text-red-600 transition-colors cursor-pointer flex items-center gap-3"
						>
						Se déconnecter
					</button>
				</div>
			)}


			{showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl relative text-gray-800">
                        <button 
                            onClick={() => setShowModal(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                        >
                            <X size={20} />
                        </button>

                        <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                            <ShieldCheck className="text-blue-600" />
                            Activer la 2FA
                        </h3>

                        <p className="text-sm text-gray-600 mb-4">
                            Scanne ce QR Code avec ton application (Google Authenticator, Authy...), puis entre le code à 6 chiffres.
                        </p>

                        {/* Rendu dynamique de l'image QR Code transmise par le backend */}
                        {qrCodeImage && (
                            <div className="flex justify-center my-4">
                                <img 
                                    src={qrCodeImage} 
                                    alt="QR Code 2FA" 
                                    className="w-48 h-48 border rounded-xl shadow-inner"
                                />
                            </div>
                        )}

                        <form onSubmit={handleConfirm2FA} className="flex flex-col gap-3">
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-700">
                                    Code de vérification (6 chiffres)
                                </label>
                                <input 
                                    type="text"
                                    maxLength={6}
                                    placeholder="123456"
                                    value={token}
                                    onChange={(e) => setToken(e.target.value)}
                                    className="w-full border border-gray-300 rounded-xl p-3 text-center text-xl font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            {error && (
                                <p className="text-red-500 text-sm font-medium text-center">{error}</p>
                            )}

                            <div className="flex gap-2 mt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="w-1/2 py-3 rounded-xl border border-gray-300 font-semibold hover:bg-gray-50 transition-colors"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading || token.length < 6}
                                    className="w-1/2 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
                                >
                                    {loading ? "Vérification..." : "Confirmer"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

		</div>
	)

}
