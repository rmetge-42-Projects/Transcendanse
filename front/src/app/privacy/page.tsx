import Link from 'next/link';

export default function Privacy() {
  return (
    <main className="bg-slate-900 min-h-screen flex flex-col justify-between items-center p-8">
      
      {/* Contenu principal */}
      <div className="max-w-2xl w-full text-gray-300">
        <h1 className="text-3xl font-bold text-indigo-400 mb-6">
          Politique de Confidentialité et Sécurité
        </h1>

        <div className="space-y-4 text-sm leading-relaxed">
          <p>
            Bienvenue sur Chi-Fou-Mi. La protection de vos données personnelles et votre sécurité sont nos priorités.
          </p>

          <h2 className="text-lg font-semibold text-white mt-4">1. Données collectées</h2>
          <p>
            Nous collectons uniquement les informations nécessaires au bon fonctionnement de l'application (pseudo, préférences de profil).
          </p>

          <h2 className="text-lg font-semibold text-white mt-4">2. Utilisation des données</h2>
          <p>
            Vos données ne sont jamais revendues à des tiers. Elles servent exclusivement à vous proposer une expérience optimale et sécurisée.
          </p>

          <h2 className="text-lg font-semibold text-white mt-4">3. Sécurité</h2>
          <p>
            Nous mettons en œuvre des mesures de sécurité pour protéger vos informations contre tout accès non autorisé.
          </p>
        </div>
      </div>
    </main>
  );
}