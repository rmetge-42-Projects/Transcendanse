import Link from 'next/link';

//page de politiqued de confidentialité (liens vers "accuille")
export default function PrivacyPage() {
  return (
    // Fond blanc pur pour un look "papier" officiel
    <main className="bg-white min-h-screen text-black font-sans">
      
      
      {/* <div className="max-w-7xl mx-auto px-6 border-b border-gray-200 py-4">
        <Link 
          href="/" 
          className="text-sm text-gray-600 hover:text-black flex items-center gap-1 transition"
        >
          ← Retour à l'accueil
        </Link>
      </div> */}

      {/* Contenu principal centré */}
      <article className="max-w-4xl mx-auto p-6 md:p-12">
        
        {/* En-tête du document */}
        <header className="mb-12 border-b-2 border-black pb-8">
          <h1 className="text-4xl font-extrabold tracking-tight mb-2">
            Politique de Confidentialité
          </h1>
          <p className="text-gray-600">
            Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </header>

        {/* Corps du texte - Style "Document Officiel" */}
        <div className="space-y-10 text-base leading-relaxed text-gray-800">
          
          <section>
            <p>
              Bienvenue sur Chi-Fou-Mi. Nous accordons une importance capitale à la confidentialité et à la sécurité de vos informations personnelles. Cette page détaille de manière transparente comment nous collectons, utilisons et protégeons vos données lorsque vous utilisez notre service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-black mb-4 border-l-4 border-gray-300 pl-3">
              1. Collecte des Données Personnelles
            </h2>
            <p className="mb-3">
              Nous limitons la collecte de données au strict nécessaire pour vous fournir le service attendu. Les informations collectées incluent :
            </p>
            <ul className="list-disc list-inside space-y-1 pl-4 text-gray-700">
              <li>Informations de profil (ex: pseudonyme, tranche d'âge, préférences).</li>
              <li>Données de connexion techniques (adresse IP anonymisée, type de navigateur) pour la sécurité et les statistiques.</li>
              <li>Contenu des communications envoyées via la plateforme.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-black mb-4 border-l-4 border-gray-300 pl-3">
              2. Finalités du Traitement
            </h2>
            <p>
              Vos données sont utilisées exclusivement pour :
            </p>
            <ul className="list-disc list-inside space-y-1 pl-4 text-gray-700">
              <li>Assurer le fonctionnement technique et l'amélioration de l'application.</li>
              <li>Permettre la mise en relation entre utilisateurs selon leurs critères.</li>
              <li>Garantir la sécurité du service et prévenir la fraude.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-black mb-4 border-l-4 border-gray-300 pl-3">
              3. Partage des Données
            </h2>
            <p>
              Chi-Fou-Mi s'engage à **ne jamais vendre ni louer** vos données personnelles à des tiers. Vos informations ne sont partagées que dans les cas suivants :
            </p>
            <ul className="list-disc list-inside space-y-1 pl-4 text-gray-700">
              <li>Aux prestataires de services techniques strictement nécessaires (ex: hébergement sécurisé).</li>
              <li>Si la loi l'exige, pour répondre à une procédure légale ou une requête gouvernementale.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-black mb-4 border-l-4 border-gray-300 pl-3">
              4. Sécurité de vos Informations
            </h2>
            <p>
              Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles rigoureuses pour protéger vos données contre tout accès non autorisé, altération, divulgation ou destruction accidentelle. L'accès aux données personnelles est strictement limité aux employés et sous-traitants qui en ont besoin pour exercer leurs fonctions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-black mb-4 border-l-4 border-gray-300 pl-3">
              5. Vos Droits (RGPD)
            </h2>
            <p>
              Conformément à la réglementation européenne (RGPD), vous disposez de droits d'accès, de rectification, d'effacement et de portabilité de vos données, ainsi que du droit de vous opposer à leur traitement. Vous pouvez exercer ces droits à tout moment en nous contactant à l'adresse indiquée ci-dessous.
            </p>
          </section>

          <section className="bg-gray-50 p-6 rounded-lg border border-gray-100 mt-16">
            <h2 className="text-xl font-bold text-black mb-3">
              6. Contact
            </h2>
            <p>
              Pour toute question relative à cette politique de confidentialité ou pour exercer vos droits, vous pouvez contacter notre Délégué à la Protection des Données (DPO) :
            </p>
            <p className="mt-3 font-mono text-sm bg-white p-3 inline-block border border-gray-200 rounded">
              privacy@chi-fou-mi.com
            </p>
          </section>

        </div>

        {/* Pied de page du document */}
        <footer className="mt-20 pt-8 border-t border-gray-100 text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} Chi-Fou-Mi. Tous droits réservés.</p>
        </footer>

      </article>
    </main>
  );
}