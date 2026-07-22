import Link from "next/link";
import { Footer } from "./privacy/footer";

export default function Home() {
  return (
    <main className="bg-gradient-to-br to-orange-500 from-rose-500 min-h-screen flex flex-col items-center justify-between ">
      <h1 className="text-blue-950 text-6xl md:text-8xl font-black mt-4">
        Chi-Fou-Mi
      </h1>
      <div>
        <Link href='/login'>
          <button className="text-blue-950 text-center">
            Se connecté / S'inscrir
          </button>
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

    </main>
  );
}
