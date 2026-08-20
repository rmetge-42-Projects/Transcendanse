'use client'

import Bottom from "@/src/display/bottom"
import Footer from "@/src/display/footer"
import Link from "next/link"
import Password from "@/src/composant/modifation/password"
import Profile from "@/src/composant/modifation/profile"
import Email from "@/src/composant/modifation/email"

export default function Modify() {
    return (
        <Bottom>
            <div className="min-h-screen bg-gray-50/50 pb-12">
                {/* Header / Navigation */}
                <div className="max-w-4xl mx-auto px-6 py-6">
                    <Link 
                        href="/profile" 
                        className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
                    >
                        ← Retour au profil
                    </Link>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mt-4">
                        Paramètres du compte
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Gère tes informations personnelles, ton adresse e-mail et ta sécurité.
                    </p>
                </div>

                {/* Section Formulaires */}
                <div className="max-w-2xl mx-auto px-4 flex flex-col gap-6">
                    <Profile />
                    <Email />
                    <Password />
                </div>
            </div>
            <Footer />
        </Bottom>
    );
}