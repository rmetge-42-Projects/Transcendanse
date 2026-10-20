import LegalBack from "@/src/composant/LegalBack";

export default function TermsPage() {
  return (
    <main className="bg-white min-h-screen text-black font-sans">
      <article className="max-w-4xl mx-auto p-6 md:p-12">
        <header className="mb-12 border-b-2 border-black pb-8">
          <LegalBack />

          <h1 className="text-4xl font-extrabold tracking-tight mb-2">
            Conditions d’utilisation
          </h1>
          <p className="text-gray-600">Dernière mise à jour : 14 octobre 2026</p>
        </header>

        <div className="space-y-10 text-base leading-relaxed text-gray-800">
          <section>
            <p>
              Bienvenue sur Chi-Fou-Mi. Ces conditions définissent les règles
              d’utilisation du service, notamment la création de profil, les matchs,
              la messagerie et les paramètres de sécurité du compte.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-black mb-4 border-l-4 border-gray-300 pl-3">
              1. Objet du service
            </h2>
            <p>
              Transendanse permet de créer un profil, découvrir d’autres utilisateurs,
              former des matchs, échanger des messages et gérer ses interactions dans un
              cadre de projet étudiant 42. Les matchs servent de contacts actifs entre
              utilisateurs.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-black mb-4 border-l-4 border-gray-300 pl-3">
              2. Compte utilisateur
            </h2>
            <p>
              Chaque utilisateur doit fournir des informations exactes, protéger son mot
              de passe et ne pas tenter d’accéder au compte d’une autre personne. La
              double authentification est disponible pour renforcer la sécurité du compte.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-black mb-4 border-l-4 border-gray-300 pl-3">
              3. Comportement attendu
            </h2>
            <p>
              Les messages insultants, menaçants, discriminatoires, frauduleux ou portant
              atteinte à la vie privée sont interdits. Les fonctionnalités de suppression
              de match et de blocage permettent de limiter les interactions non souhaitées.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-black mb-4 border-l-4 border-gray-300 pl-3">
              4. Données et contenus
            </h2>
            <p>
              Les utilisateurs restent responsables des textes et avatars qu’ils ajoutent.
              Les contenus manifestement abusifs peuvent être supprimés pendant la
              maintenance du projet.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-black mb-4 border-l-4 border-gray-300 pl-3">
              5. Disponibilité
            </h2>
            <p>
              Le service est fourni pour une démonstration pédagogique. Des interruptions
              peuvent survenir pendant les tests, les mises à jour ou la réinitialisation
              de l’environnement Docker.
            </p>
          </section>

          <section className="bg-gray-50 p-6 rounded-lg border border-gray-100 mt-16">
            <h2 className="text-xl font-bold text-black mb-3">
              6. Contact
            </h2>
            <p>
              Pour une question sur ces conditions ou sur le fonctionnement du service :
            </p>
            <p className="mt-3 font-mono text-sm bg-white p-3 inline-block border border-gray-200 rounded">
              contact@chi-fou-mi.com
            </p>
          </section>
        </div>

        <footer className="mt-20 pt-8 border-t border-gray-100 text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} Chi-Fou-Mi. Tous droits réservés.</p>
        </footer>
      </article>
    </main>
  );
}
