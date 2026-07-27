'use client'
import Bottom from "../../component/display/bottom"
import Footer from "@/src/component/footer"
import { METHODS } from "http"
import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"

//page de connection
export default function Login()
{
  const router = useRouter();
  const [invalide, setInvalide] = useState('');
  async function submit(e : React.FormEvent<HTMLFormElement>)
  {
    e.preventDefault()
    console.log({email, password});
    try {
      const reponse = await(fetch('http://localhost:4000/auth/login', {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })}));
      const data = await(reponse.json());
      console.log(data);
      if (data.success === true)
      {
        localStorage.setItem('token', data.access_token);
        router.push("/profile");
      }
      else 
      {
        setInvalide(data.message);
        setEmail('');
        setPassword('');
      }
    }
    catch(error)
    {
      console.error("error de connextion : ", error);
    }
  }
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
            {/* <h1 className="text-blue-950 text-6xl md:text-8xl font-black mt-4">
              Chi-Fou-Mi
            </h1> */}
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md ">
            
              <h2 className="text-center text-2xl">Login</h2>
              <form onSubmit={submit} className="flex flex-col gap-4">
                <label>Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="rounded px-3 py-2 w-full border "/>
                <label>Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="rounded px-3 py-2 w-full border "/>
                {invalide && <p className="text-red-500">{invalide}</p>}
                <button className="bg-blue-600 text-white rounded p-2 mt-4">Login</button>
              </form>
            </div>
            <Footer/>
        </Bottom>
    )
}