import Link from "next/link";
import Bottom from "@/src/display/bottom";
import Footer from "@/src/display/footer";

export default function Connextion({title, children} : {title: string, children: React.ReactNode})
{
    return(
        <Bottom>
            <div className="w-full px-6 border-gray-200 py-4">
		    	<Link 
		    		href="/" 
		    		className="text-sm text-gray-600 hover:text-black flex items-center gap-1 transition"
                    >
		    		← Retour à l'accueil
		    	</Link>
		    </div>
            <div className="bg-white flex flex-col items-center p-8 rounded-xl shadow-lg w-full max-w-md mx-auto my-auto">
			    <h1 className="text-center text-2xl font-bold text-blue-950 mb-6">{title}</h1>
                {children}
            </div>
            <Footer/>
        </Bottom>
    );
}