import Bottom from "@/src/display/bottom";
import Footer from "@/src/display/footer";

// export default function IfIsError({children} : { children: React.ReactNode }){
//   return (
//     <Bottom>
//       <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-6">
//         <p className=" font-bold text-2xl">
//           {/* Erreur : impossible de charger le profil. */}
//           {children}
//         </p>
//       </div>
//       <Footer />
//     </Bottom>
//   );

// }

// interface IfIsErrorProps {
//   children?: React.ReactNode; // Le '?' le rend optionnel
// }

export default function IfIsError({ 
  children = "Une erreur est survenue lors du chargement." 
}: {children?: React.ReactNode}) {
  return (
    <Bottom>
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-6">
        <p className="font-bold text-2xl text-red-600">
          {children}
        </p>
      </div>
      <Footer />
    </Bottom>
  );
}