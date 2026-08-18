import Bottom from "@/src/display/bottom";
import Footer from "@/src/display/footer";

export default function IfIsError(){
  return (
    <Bottom>
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-6">
        <p className=" font-bold text-2xl">
          Erreur : impossible de charger le profil.
        </p>
      </div>
      <Footer />
    </Bottom>
  );

}