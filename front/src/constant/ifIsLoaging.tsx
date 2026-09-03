import Bottom from "@/src/display/bottom";
import Footer from "@/src/display/footer";

// export default function IfIsLoading({message} : { message : string })
// {
//     return (
//       <Bottom>
//         <div className="flex flex-col items-center justify-center min-h-[70vh]">
//           <div className="w-14 h-14 border-4 border-blue-950 border-t-transparent rounded-full animate-spin" />
//           <p className="mt-6 text-gray-600 font-medium text-lg">
//             {/* Chargement du profil... */}
//             {message}
//           </p>
//         </div>
//         <Footer />
//       </Bottom>
//     );
// }

export default function IfIsLoading({ 
  children = "Chargement." 
}: {children?: React.ReactNode}) {
  return (
      <Bottom>
        <div className="flex flex-col items-center justify-center min-h-[70vh]">
          <div className="w-14 h-14 border-4 border-blue-950 border-t-transparent rounded-full animate-spin" />
          <p className="mt-6 text-gray-600 font-medium text-lg">
            {/* Chargement du profil... */}
            {children}
          </p>
        </div>
        <Footer />
      </Bottom>
    );
}