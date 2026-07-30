'use client'
import Bottom from "@/src/component/display/bottom"
import Footer from "@/src/component/footer"
import { useState } from "react"
import { useRouter } from "next/navigation"

export  default function CreateAccount()
{
	const [name, setName] = useState('');
	const [birthday, setBirthday] = useState('');
	const [username, setUsername] = useState('');
	const [kind, setKind] = useState('');
	const [orientation, setOrientation] = useState('');
	const [biography, setBiography] = useState('');
	const router = useRouter();
	const [invalide, setInvalide] = useState('');


	async function submit(e:React.FormEvent<HTMLFormElement>) 
	{
		e.preventDefault();

		try {
			const token = localStorage.getItem('token');
			if (token)
			{
				const formatBackDate = new Date(birthday).toISOString();
				const reponse = await(fetch('http://localhost:4000/auth/createProfile', {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						// "Authorization": `Bearer ${token}`,
					},
					body: JSON.stringify({name, username, birthday:formatBackDate, kind, orientation, biography})
				}))
				const data = await(reponse.json());
				console.log(data);
				if (data.success === true)
					router.push("/profile");
				else
					setInvalide("Error, reessayer");
			}
			else 
				setInvalide("Utilisateur non connecter");

		}
		catch(error)
		{
			console.error("error de connextion : ", error);
		}
	}

	return(
		<Bottom>
			<div className="flex flex-col iten:centers justify-center min-h-[70vh] px-4 ">
				<h1 className="text-blue-950 text-3xl md:text-6xl font-black text-center">
					Create Profile
				</h1>
				<form onSubmit={submit} className="w-full max-w-md mx-auto flex flex-col gap-4 mt-6">
					<p className="text-black mt-2  text-center">
						Remplis tes informations pour personnaliser ton compte.
					</p>
					<div className="flex flex-col gap-2">
						<label className="text-sm font-semibold text-gray-700">
							Name
						</label>
						<input
							type="text"
							placeholder="ex: alexendre"
							required
							value={name}
							onChange={(e) => setName(e.target.value)}
							className="rounded  px-3 py-2 w-full bg-white border "
						/>
						<label 
							className="text-sm font-semibold text-gray-700">
							Username
						</label>
						<input
							type="text"
							placeholder="ex: alex_dev"
							required
							value={username}
							onChange={(e) => setUsername(e.target.value)}
							className="rounded px-3 py-2 w-full bg-white border "
						/>
						<label className="text-sm font-semibold text-gray-700">
							Birthday
						</label>
						<input
							type="date"
							required
							value={birthday}
							onChange={(e) => setBirthday(e.target.value)}
							className="rounded px-3 py-2 w-full bg-white border "
						/>
						<label className="text-sm font-semibold text-gray-700">
							Kind
						</label>
						<select
							required
							value={kind}
							onChange={(e) => setKind(e.target.value)}
							className="rounded px-3 py-2 w-full bg-white border "
						>
							<option value="" disabled hidden>
								Select an option
							</option>
							<option value="man">Man</option>
							<option value="woman">Woman</option>
							<option value="non_binary">Non-binary</option>
						</select>
						<label className="text-sm font-semibold text-gray-700">
							Sexual Orientation
						</label>
						<select
							required
							value={orientation}
							onChange={(e) => setOrientation(e.target.value)}
							className="rounded px-3 py-2 w-full bg-white border "
						>
							<option value="" disabled hidden>
								Select an option
							</option>
							<option value="Men">Men</option>
							<option value="Weman">Weman</option>
							<option value="All">All</option>
						</select>
						<label className="text-sm font-semibold text-gray-700">
							Biography
						</label>
						<input
							type="text"
							placeholder="j'aime les fleures ......"
							value={biography}
							onChange={(e) => setBiography(e.target.value)}
							className="rounded  px-3 py-2 w-full bg-white border "
						/>
					</div>
					{invalide && <p className="bg-red-600 text-white font-bold px-3 py-1 rounded-lg">{invalide}</p>}
					<button className="bg-blue-950 text-white rounded p-2 mt-4">Submit</button>
				</form>
			</div>
			<Footer/>
		</Bottom>
	)
}
