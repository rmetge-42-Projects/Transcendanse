import Bottom from "../../component/display/bottom"
import Footer from "@/src/component/footer"
import Link from "next/link"

//page de connection
export default function Login()
{
    return(
        <Bottom>
            <div className="w-full px-6  border-gray-200 py-4">
              <Link 
                href="/" 
                className="text-sm text-gray-600 hover:text-black flex items-center gap-1 transition"
              >
                ← Retour à l'accueil
              </Link>
            </div>
            <h1 className="text-blue-950 text-6xl md:text-8xl font-black mt-4">
              Chi-Fou-Mi
            </h1>
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md ">

                <h2 className="text-center text-2xl">Login</h2>
                <form className="flex flex-col gap-4">
                    <label>Email</label>
                    <input type="email" className="rounded px-3 py-2 w-full border "></input>
                    <label>Password</label>
                    <input type="password" className="rounded px-3 py-2 w-full border "></input>
                    <button className="bg-blue-600 text-white rounded p-2 mt-4">Login</button>
                </form>

            </div>
            <Footer/>
        </Bottom>
    )
}