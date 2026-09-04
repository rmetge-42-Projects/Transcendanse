import { UserConversationType } from "@/src/type/conversation";
import { User } from "lucide-react";
import { Send } from "lucide-react";
import IfIsLoading from "@/src/constant/ifIsLoaging";
import { MessageType } from "@/src/type/conversation";

import { useMessages } from "@/src/hook/conversation";

interface ContactProps {
  selectedUser: UserConversationType | null;
  setSelectedUser: (user: UserConversationType) => void;
}
export default function Duiscution({ selectedUser, setSelectedUser }: ContactProps){


    const { data: messages, isLoading} = useMessages(
      selectedUser?.userId,
    ); //pas encore implementer

		if (!selectedUser)
			{
				return (
					<div className="flex-1 flex items-center justify-center text-gray-400">
					Sélectionnez une conversation pour commencer
				</div>
			)
		}
		
		if (isLoading)
		{
			return (
				< div className=" min-h-screen flex flex-col justify-between p-8 w-full">
					<IfIsLoading>Chargement de la discution</IfIsLoading>
				</div>
			)
		}

    return (

			<div className="flex-1 flex flex-col bg-white">
							{/* Entête du chat */}
							<div className="p-4 border-b border-gray-200 flex items-center gap-3">
								<div className="w-10 h-10 rounded-full bg-blue-950 flex items-center justify-center text-white font-bold">
									<User className="w-5 h-5" />
								</div>
								<span className="font-bold text-gray-800">
									{selectedUser.userName}
								</span>
							</div>


							<div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3">
      					{messages && messages.length > 0 ? (
      					  messages.map((msg) => {
      					    const isMe = msg.senderId !== selectedUser.userId;
									
      					    return (
      					      <div
      					        key={msg.id}
      					        className={`max-w-[70%] p-3 rounded-2xl text-sm ${
      					          isMe
      					            ? "bg-blue-950 text-white self-end rounded-br-none"
      					            : "bg-gray-100 text-gray-800 self-start rounded-bl-none"
      					        }`}
      					      >
      					        <p>{msg.message}</p>
      					        <span
      					          className={`text-[10px] block mt-1 text-right ${
      					            isMe ? "text-gray-300" : "text-gray-400"
      					          }`}
      					        >
      					          {new Date(msg.messageDate).toLocaleTimeString([], {
      					            hour: "2-digit",
      					            minute: "2-digit",
      					          })}
      					        </span>
      					      </div>
      					    );
      					  })
      					) : (
      					  /* Texte affiché s'il n'y a aucun message */
      					  <p className="text-center text-gray-400 text-sm my-auto">
      					    Début de votre conversation avec {selectedUser.userName}
      					  </p>
      					)}
    					</div>
							
							{/* Zone des messages */}
							{/* <div className="flex-1 p-4 overflow-y-auto">
								<p className="text-center text-gray-400 text-sm">
									Début de votre conversation avec {selectedUser.userName}
								</p>
							</div> */}
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
				</div>
		)
}
