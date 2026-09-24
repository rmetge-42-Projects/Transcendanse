import { useConversation } from "@/src/hook/conversation";
import { User } from "lucide-react";
import IfIsError from "@/src/constant/ifIsError";
import IfIsLoading from "@/src/constant/ifIsLoaging";
import { useState } from "react";
import { UserConversationType } from "@/src/type/conversation";

interface ContactProps {
  selectedUser: UserConversationType | null;
  setSelectedUser: (user: UserConversationType) => void;
}

export default function Contact({ selectedUser, setSelectedUser }: ContactProps) {
  const { data: users, isLoading, isError } = useConversation();

  if (isLoading) {
    return (
		< div className=" min-h-screen flex flex-col justify-between p-8">
			<IfIsLoading>Chargement des contacts...</IfIsLoading>
		</div>
	  );
  }
  if (isError) {
    return <IfIsError>Erreur : impossible d'accéder aux contacts.</IfIsError>;
  }

  return (
    <>
      <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-gray-200 bg-gray-50/50 flex flex-col shrink-0">
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
              selectedUser?.userId === user.userId
                ? "bg-gray-200/60"
                : "hover:bg-gray-100/80"
            }`}
          >
            <div className="relative shrink-0 ">
							<div className="w-10 h-10 rounded-full bg-blue-950 flex items-center justify-center text-white font-b             old">
								<User className="w-5 h-5" />
							</div>
					    {user.isOnline && (
								<span className="w-3 h-3 bg-green-500 rounded-full border-2 border-white absolute bottom-0 right-0" />
              )}
            </div>
             <div className="flex flex-col overflow-hidden">
              <span className="font-semibold text-gray-800">
                {user.userName}
              </span>
             
              {/* attention pas de sisteme de vu de message pour le moment */}
              <div className="flex items-center justify-between gap-2 w-full mt-0.5">
            
                <span
                  className={`text-sm truncate ${
                    user.unreadCount > 0
                      ? "text-gray-900 font-semibold"
                      : "text-gray-400"
                  }`}
                >
                  {user.unreadCount > 1
                    ? `${user.unreadCount} nouveaux messages`
                    : user.lastMessage || "Aucun message"}
                </span>

                {user.unreadCount > 0 && (
                  <span className=" flex items-center justify-center w-2 h-2 bg-orange-500 rounded-full "/>
                )}
              </div>
            </div>
          </div>
          ))}
        </div>
      </div>
    </>
  );
}
