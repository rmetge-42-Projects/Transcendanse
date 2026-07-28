'use client'
import Bottom from "@/src/component/display/bottom"
import { useRouter } from "next/navigation";
import Footer from "@/src/component/footer";
import { useState } from "react";

export default function Profile(){
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    function menu() {
        setIsOpen(!isOpen);
    }
    function logout() {
      // 1. Demander une confirmation à l'utilisateur
      const confirmLogout = window.confirm("Es-tu sûr de vouloir te déconnecter ?");
        
      if (confirmLogout) {
        // 2. Supprimer le token du localStorage
        localStorage.removeItem('token');
    
        // 3. Rediriger vers la page d'accueil
        router.push('/');
      }
    }
    return(
        <Bottom>
            <h1>your profile</h1>

            {/* Conteneur principal du menu */}
            <div style={{ position: 'absolute', top: '16px', right:'16px', zIndex: 50 }}>
                
                {/* 2. Bouton  */}
                <button onClick={menu}>
                    ⚙️ {isOpen ? '▲' : '▼'}
                </button>

                {/* 3. Le volet déroulant  */}
                {isOpen && (
                    <div style={{
                        position: 'absolute',
                        right: 0,
                        marginTop: '8px',
                        backgroundColor: '#ffffff',
                        border: '1px solid #ccc',
                        borderRadius: '6px',
                        padding: '8px',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                        zIndex: 10
                    }}>
                        {/* Onglet Déconnexion dans le volet */}
                        <span
                            onClick={logout}
                            style={{
                                fontWeight: '500',
                                cursor: 'pointer',  // Affiche la petite main au survol
                                color: '#ff4d4f',}}>
                            Logout
                        </span>
                    </div>
                )}

            </div>

            <Footer/>
        </Bottom>
    );
}