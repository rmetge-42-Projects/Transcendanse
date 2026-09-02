"use client";
import Navigation from "@/src/display/navigation";
import Bottom from "@/src/display/bottom";
import { User } from "lucide-react";
import { useConversation, useMessages } from "@/src/hook/conversation";
import { UserConversationType, MessageType } from "@/src/type/conversation";
import { useState } from "react";
import IfIsLoading from "@/src/composant/profile/ifIsLoaging";
import IfIsError from "@/src/composant/profile/ifIsError";
import { Send } from "lucide-react";

export default function Message() {

  const { data: users, isLoading: isLoadingUser, isError,} = useConversation();  
	const [selectedUser, setSelectedUser] = useState<UserConversationType | null>(null);
	const { data: messages, isLoading : isLoadingMessage } = useMessages(selectedUser?.userId);//pas encore implementer

	if (isLoadingUser || isLoadingMessage) { //modifier car par raport au profile
		return <IfIsLoading />;
	}
	if (isError) {
		return <IfIsError />;
	}

	if (isLoadingMessage) {
		return <IfIsLoading />;
	}

  return (
    <Bottom>
      {/* Conteneur principal */}
      <div className="max-w-6xl w-full mx-auto my-auto min-h-[75vh] flex flex-col justify-center px-4 pb-16">
        
        {/* Grande boîte blanche divisée en 2 */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row h-[70vh] w-full border border-gray-200/80">
          
          {/* Bande à gauche : liste des utilisateurs */}
          <div className="w-full md:w-80 border-r border-gray-200 bg-gray-50/50 flex flex-col">
            <div className="p-4 border-b border-gray-200 font-bold text-lg text-gray-800">
              Messages
            </div>
            <div className="flex-1 overflow-y-auto">
              {users?.map((user) => (
                <div
                  key={user.userId}
       					 	onClick={() => setSelectedUser(user)}
                  // 3. Applique la couleur si c'est l'utilisateur sélectionné
                  className={`p-4 border-b border-gray-100 flex items-center gap-3 cursor-pointer transition ${
                    selectedUser?.userId === user.userId ? "bg-gray-200/60" : "hover:bg-gray-100/80"
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-blue-950 flex items-center justify-center text-white font-bold">
                    <User className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col overflow-hidden">
                	  <span className="font-semibold text-gray-800">{user.userName}</span>
                	  <span className="text-sm text-gray-400 truncate">{user.lastMessage}</span>
                	</div>
                </div>
              ))}
            </div>
          </div>

          {/* Page blanche à droite */}
          {/* <div className="flex-1 bg-white flex items-center justify-center text-gray-400">
            Discussion
          </div> */}
					<div className="flex-1 flex flex-col bg-white">
            {selectedUser ? (
              <>
                {/* Entête du chat */}
                <div className="p-4 border-b border-gray-200 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-950 flex items-center justify-center text-white font-bold">
                    <User className="w-5 h-5" />
                  </div>
                  <span className="font-bold text-gray-800">{selectedUser.userName}</span>
                </div>

                {/* Zone des messages reçus/envoyés */}
                <div className="flex-1 p-4 overflow-y-auto">
                  <p className="text-center text-gray-400 text-sm">
                    Début de votre conversation avec {selectedUser.userName}
                  </p>
                </div>

                {/* Champ de saisie */}
                <div className="p-4 border-t border-gray-200 flex gap-2">
                  <input
                    type="text"
                    placeholder="Écrivez votre message..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:border-blue-950"
                  />
                  <button className="bg-blue-950 text-white p-2.5 rounded-full hover:bg-blue-900 transition">
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              /* Message si aucun profil sélectionné */
              <div className="flex-1 flex items-center justify-center text-gray-400">
                Sélectionnez une conversation pour commencer
              </div>
            )}
          </div>

        </div>
      </div>

      <Navigation />
    </Bottom>
  );
}

// {/* Panneau à droite : Zone de discussion */}
//           <div className="flex-1 flex flex-col bg-white">
//             {selectedUser ? (
//               <>
//                 {/* Entête du chat */}
//                 <div className="p-4 border-b border-gray-200 flex items-center gap-3">
//                   <div className="w-10 h-10 rounded-full bg-blue-950 flex items-center justify-center text-white font-bold">
//                     <User className="w-5 h-5" />
//                   </div>
//                   <span className="font-bold text-gray-800">{selectedUser.userName}</span>
//                 </div>

//                 {/* Zone des messages reçus/envoyés */}
//                 <div className="flex-1 p-4 overflow-y-auto">
//                   <p className="text-center text-gray-400 text-sm">
//                     Début de votre conversation avec {selectedUser.userName}
//                   </p>
//                 </div>

//                 {/* Champ de saisie */}
//                 <div className="p-4 border-t border-gray-200 flex gap-2">
//                   <input
//                     type="text"
//                     placeholder="Écrivez votre message..."
//                     className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:border-blue-950"
//                   />
//                   <button className="bg-blue-950 text-white p-2.5 rounded-full hover:bg-blue-900 transition">
//                     <Send className="w-4 h-4" />
//                   </button>
//                 </div>
//               </>
//             ) : (
//               /* Message si aucun profil sélectionné */
//               <div className="flex-1 flex items-center justify-center text-gray-400">
//                 Sélectionnez une conversation pour commencer
//               </div>
//             )}