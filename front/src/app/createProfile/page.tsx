'use client'
import Bottom from "@/src/display/bottom"
import Footer from "@/src/display/footer"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from 'react-hook-form';
import { api } from '@/src/lib/axios';
//page de creation de compte où on rentre toute les info personnel

type ProfileFormValues = {
	name: string;
	username: string;
	birthday: Date;
	kind: string;
	orientation: string;
	biography: string;
};

export  default function CreateAccount()
{
	const router = useRouter();
	const [invalide, setInvalide] = useState('');
	const [isSumit, setIsSumbit] = useState(false);

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<ProfileFormValues>();

	const onSubmit = async (data: ProfileFormValues) => 
	{
		setInvalide('');
		setIsSumbit(true);
		// data.name;
		// data.username;
		// data.birthday;
		// data.kind;
		// data.orientation;
		// data.biography;
		try {
			const res = await api.post("/auth/createProfile", data);
			router.push("/profile");
		}
		catch(error)
		{
			setInvalide("Error, reessayer");
		}
		finally{
			setIsSumbit(false);
		}
	}

	return(
		<Bottom>
			<div className="flex flex-col iten:centers justify-center min-h-[70vh] px-4 ">
				<h1 className="text-blue-950 text-3xl md:text-6xl font-black text-center">
					Create Profile
				</h1>
				<form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md mx-auto flex flex-col gap-4 mt-6">
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
							{...register("name", {required: "Le nom est obligatoire"})}
							className="rounded  px-3 py-2 w-full bg-white border "
						/>
						{errors.name && <p className="bg-red-600 text-white text-sm mt-1">{errors.name.message}</p>}
						<label 
							className="text-sm font-semibold text-gray-700">
							Username
						</label>
						<input
							type="text"
							placeholder="ex: alex_dev"
							{...register("username", {required: "Le nom d'utilisateur est obligatoire"})}
							className="rounded px-3 py-2 w-full bg-white border "
						/>
						{errors.username && <p className="bg-red-600 text-white text-sm mt-1">{errors.username.message}</p>}
						<label className="text-sm font-semibold text-gray-700">
							Birthday
						</label>
						<input
							type="date"
							{...register("birthday", {required: "La date d'anniversaire est obligatoire"})}
							className="rounded px-3 py-2 w-full bg-white border "
						/>
						{errors.birthday && <p className="bg-red-600 text-white text-sm mt-1">{errors.birthday.message}</p>}
						<label className="text-sm font-semibold text-gray-700">
							Kind
						</label>
						<select
							{...register("kind", {required: "Le genre est obligatoire"})}
							className="rounded px-3 py-2 w-full bg-white border "
						>
							<option disabled hidden>
								Select an option
							</option>
							<option value="man">Man</option>
							<option value="woman">Woman</option>
							<option value="non_binary">Non-binary</option>
						</select>
						{errors.kind && <p className="bg-red-600 text-white text-sm mt-1">{errors.kind.message}</p>}
						<label className="text-sm font-semibold text-gray-700">
							Sexual Orientation
						</label>
						<select
							{...register("orientation", {required: "L'orientation sexuelle est obligatoire"})}
							className="rounded px-3 py-2 w-full bg-white border "
						>
							<option disabled hidden>
								Select an option
							</option>
							<option value="Men">Man</option>
							<option value="Woman">Woman</option>
							<option value="All">All</option>
						</select>
						{errors.orientation && <p className="bg-red-600 text-white text-sm mt-1">{errors.orientation.message}</p>}
						<label className="text-sm font-semibold text-gray-700">
							Biography
						</label>
						<input
							type="text"
							placeholder="j'aime les fleures ......"
							{...register("biography")}
							className="rounded  px-3 py-2 w-full bg-white border "
						/>
					</div>
					{invalide && <p className="bg-red-600 text-white font-bold px-3 py-1 rounded-lg">{invalide}</p>}
					<button 
						type= "submit"
						disabled={isSumit}
						className="bg-blue-950 text-white rounded p-2 mt-4"
					>
						{isSumit ? "Connexion..." : "Submit"}
					</button>
				</form>
			</div>
			<Footer/>
		</Bottom>
	)
}


// 'use client'

// import Bottom from "@/src/display/bottom"
// import Footer from "@/src/display/footer"
// import { useState } from "react"
// import { useRouter } from "next/navigation"
// import { useForm } from 'react-hook-form'
// import { api } from '@/src/lib/axios'
// import { useQueryClient } from "@tanstack/react-query"

// type ProfileFormValues = {
//     name: string;
//     username: string;
//     birthday: string; // string pour les inputs type="date"
//     kind: string;
//     orientation: string;
//     biography: string;
// };

// export default function CreateAccount() {
//     const router = useRouter();
//     const queryClient = useQueryClient(); // Déclaration indispensable pour invalider le cache
//     const [invalide, setInvalide] = useState('');
//     const [isSubmitting, setIsSubmitting] = useState(false);

//     const {
//         register,
//         handleSubmit,
//         formState: { errors },
//     } = useForm<ProfileFormValues>({
//         defaultValues: {
//             kind: "",
//             orientation: "",
//         }
//     });

//     const onSubmit = async (data: ProfileFormValues) => {
//         setInvalide('');
//         setIsSubmitting(true);

//         try {
//             await api.post("/auth/createProfile", data);
            
//             // Invalide 'userMe' pour que la page /profile charge directement le nouveau profil
//             await queryClient.invalidateQueries({ queryKey: ['userMe'] });
            
//             router.push("/profile");
//         } catch (error) {
//             setInvalide("Erreur lors de la création du profil, réessaie.");
//         } finally {
//             setIsSubmitting(false);
//         }
//     };

//     return (
//         <Bottom>
//             <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
//                 <h1 className="text-blue-950 text-3xl md:text-6xl font-black text-center">
//                     Create Profile
//                 </h1>
                
//                 <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md mx-auto flex flex-col gap-4 mt-6">
//                     <p className="text-black mt-2 text-center">
//                         Remplis tes informations pour personnaliser ton compte.
//                     </p>

//                     <div className="flex flex-col gap-2">
//                         {/* NAME */}
//                         <label className="text-sm font-semibold text-gray-700">Name</label>
//                         <input
//                             type="text"
//                             placeholder="ex: Alexandre"
//                             {...register("name", { required: "Le nom est obligatoire" })}
//                             className="rounded px-3 py-2 w-full bg-white border"
//                         />
//                         {errors.name && <p className="bg-red-600 text-white text-sm mt-1 p-1 rounded">{errors.name.message}</p>}

//                         {/* USERNAME */}
//                         <label className="text-sm font-semibold text-gray-700">Username</label>
//                         <input
//                             type="text"
//                             placeholder="ex: alex_dev"
//                             {...register("username", { required: "Le nom d'utilisateur est obligatoire" })}
//                             className="rounded px-3 py-2 w-full bg-white border"
//                         />
//                         {errors.username && <p className="bg-red-600 text-white text-sm mt-1 p-1 rounded">{errors.username.message}</p>}

//                         {/* BIRTHDAY */}
//                         <label className="text-sm font-semibold text-gray-700">Birthday</label>
//                         <input
//                             type="date"
//                             {...register("birthday", { required: "La date d'anniversaire est obligatoire" })}
//                             className="rounded px-3 py-2 w-full bg-white border"
//                         />
//                         {errors.birthday && <p className="bg-red-600 text-white text-sm mt-1 p-1 rounded">{errors.birthday.message}</p>}

//                         {/* KIND */}
//                         <label className="text-sm font-semibold text-gray-700">Kind</label>
//                         <select
//                             {...register("kind", { required: "Le genre est obligatoire" })}
//                             className="rounded px-3 py-2 w-full bg-white border"
//                         >
//                             <option value="" disabled hidden>Select an option</option>
//                             <option value="man">Man</option>
//                             <option value="woman">Woman</option>
//                             <option value="non_binary">Non-binary</option>
//                         </select>
//                         {errors.kind && <p className="bg-red-600 text-white text-sm mt-1 p-1 rounded">{errors.kind.message}</p>}

//                         {/* ORIENTATION */}
//                         <label className="text-sm font-semibold text-gray-700">Sexual Orientation</label>
//                         <select
//                             {...register("orientation", { required: "L'orientation sexuelle est obligatoire" })}
//                             className="rounded px-3 py-2 w-full bg-white border"
//                         >
//                             <option value="" disabled hidden>Select an option</option>
//                             <option value="man">Man</option>
//                             <option value="woman">Woman</option>
//                             <option value="all">All</option>
//                         </select>
//                         {errors.orientation && <p className="bg-red-600 text-white text-sm mt-1 p-1 rounded">{errors.orientation.message}</p>}

//                         {/* BIOGRAPHY */}
//                         <label className="text-sm font-semibold text-gray-700">Biography</label>
//                         <input
//                             type="text"
//                             placeholder="j'aime les fleurs..."
//                             {...register("biography")}
//                             className="rounded px-3 py-2 w-full bg-white border"
//                         />
//                     </div>

//                     {invalide && <p className="bg-red-600 text-white font-bold px-3 py-1 rounded-lg">{invalide}</p>}

//                     <button 
//                         type="submit"
//                         disabled={isSubmitting}
//                         className="bg-blue-950 text-white rounded p-2 mt-4 cursor-pointer disabled:bg-gray-400"
//                     >
//                         {isSubmitting ? "Création..." : "Submit"}
//                     </button>
//                 </form>
//             </div>
//             <Footer />
//         </Bottom>
//     );
// }