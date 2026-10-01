'use client'
import { Settings, UserPen, Lock } from "lucide-react"
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/src/lib/axios";
import { useQueryClient } from "@tanstack/react-query";

export default function Menu()
{
	const router = useRouter();
	const queryClient = useQueryClient();
	const [isOpen, setIsOpen] = useState(false);

	function menu() {
    setIsOpen(!isOpen);
  }

	const logout = async () => {
    	const confirmLogout = window.confirm("Es-tu sûr de vouloir te déconnecter ?");
    	if (!confirmLogout) return;
    	try {
        	await api.patch('/users/status', { isOnline: false });
    	} catch (e) {
        	console.error("Erreur lors de la déconnexion", e);
    	} finally {
        	localStorage.removeItem('token');
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
					<button
						onClick={logout}
						className="w-full text-left px-4 py-3 rounded-xl hover:bg-red-50 font-semibold text-red-600 transition-colors cursor-pointer flex items-center gap-3"
						>
						Se déconnecter
					</button>
				</div>
			)}
		</div>
	)

}