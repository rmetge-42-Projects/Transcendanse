import Link from "next/link";
import Footer from "../component/footer";
import Bottom from "../component/display/bottom";

//page d'accuille (liens vers "politique de confidentialité" et "login")
export default function Home() {
  return (
    <main>
      <Bottom>
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
      <div className="max-w-2xl text-center text-gray-300 text-lg">
        <p>Chi-fou-mi est une aplication de rencontre good vibes pour l'été. </p>
        <p>Ici on veux du fun, de quoi se detandre pendant les meuilleur moi de l'année, faire des rencontre.
          Et pourquoi pas meme trouvez votre rayon de soleil de l'été ou  ... de votre vie.</p>
        <p>Une application qui commence par un jeux, le gagnent aura le droit de lancé la conversation
        </p>
      </div>


      <Footer/>
      </Bottom>
    </main>
  );
}
