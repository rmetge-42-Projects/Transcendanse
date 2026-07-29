import Link from "next/link";
import Footer from "../component/footer";
import Bottom from "../component/display/bottom";
//page d'accuille (liens vers "politique de confidentialité" et "login")

export default function Home() {
  return (
    <Bottom>
      <div className="flex flex-col items-center text-center gap-8 my-auto w-full">
        <h1 className="text-blue-950 text-6xl md:text-8xl font-black mt-4">
          Chi-Fou-Mi
        </h1>
        <div>
          <Link 
            href="/login" 
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-6 rounded-xl transition duration-200 shadow-lg inline-block"
          >
            Se connecter / S'inscrire
          </Link>
        </div>
        <div className="max-w-2xl text-center text-gray-100 text-lg flex flex-col gap-3">
          <p>
            Chi-fou-mi est une application de rencontre good vibes pour l'été.
          </p>
          <p>
            Ici on veut du fun, de quoi se détendre pendant les meilleurs mois de l'année, faire des rencontres. 
            Et pourquoi pas même trouver votre rayon de soleil de l'été ou... de votre vie.
          </p>
          <p className="font-medium">
            Une application qui commence par un jeu : le gagnant aura le droit de lancer la conversation !
          </p>
        </div>

      </div>

      <Footer />
    </Bottom>
  );
}