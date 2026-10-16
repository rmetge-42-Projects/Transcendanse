import { useConversation, useMatches } from "@/src/hook/conversation";
import { User } from "lucide-react";
import IfIsError from "@/src/constant/ifIsError";
import IfIsLoading from "@/src/constant/ifIsLoaging";
import { useState } from "react";
import { UserConversationType } from "@/src/type/conversation";
import { UserType } from "@/src/type/user";
import BlockedUsers from "@/src/composant/message/BlockedUsers";

interface ContactProps {
  selectedUser: UserConversationType | null;
  setSelectedUser: (user: UserConversationType) => void;
}

export default function Contact({ selectedUser, setSelectedUser }: ContactProps) {
  const { data: users, isLoading, isError } = useMatches();

  if (isLoading) {
    return (
      // <div className=" min-h-screen flex flex-col justify-between p-8">
        <IfIsLoading>Chargement des contacts...</IfIsLoading>
      // </div>
    );
  }
  if (isError) {
    return <IfIsError>Erreur : impossible d'accéder aux contacts.</IfIsError>;
  }

  // Un match supprimé ou un contact bloqué sort de la liste
  const visibleUsers = users?.filter((user) => user.isActive !== false && !user.isBlocked) ?? [];
  const blockedUsers = users?.filter((user) => user.isBlocked) ?? [];
  // Match tout neuf : aucun message echange et conversation jamais ouverte
  const showNewMatch = (user: UserType) => {
    return user.isNewMatch === true && (user.unreadCount ?? 0) === 0;
  };

  // Texte affiche sous le nom du contact
  const getPreview = (user: UserType) => {
    if (showNewMatch(user)) {
      return "Nouveau match !";
    }
    if (!user.lastMessage) {
      return "Aucun message";
    }
    return user.lastMessage;
  };

  return (
    <>
      <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-gray-200 bg-gray-50/50 flex flex-col shrink-0">
        <div className="p-4 border-b border-gray-200 font-bold text-lg text-gray-800">
          Messages
        </div>
        <div className="flex-1 overflow-y-auto">
          {visibleUsers.map((user) => (
            <div
              key={user.id}
              // onClick={() => setSelectedUser(user)}

              onClick={() =>
                setSelectedUser({
                  userPhoto: user.photo,
                  userId: user.id,
                  userName: user.username,
                  lastMessage: "",
                  lastMessageDate: "",
                  unreadCount: 0,
                  isActive: user.isActive,
                  isBlocked: user.isBlocked,
                  isOnline: user.isOnline,
                })
              }
              // 3. Applique la couleur si c'est l'utilisateur sélectionné
              className={`p-4 border-b border-gray-100 flex items-center gap-3 cursor-pointer transition ${
                selectedUser?.userId === user.id
                  ? "bg-gray-200/60"
                  : "hover:bg-gray-100/80"
              }`}
            >
              <div className="relative shrink-0">
                <div className="w-10 h-10 rounded-full bg-blue-950 flex items-center justify-center text-white font-bold overflow-hidden shadow-sm">
                  {user.photo ? (
                    <img
                      src={user.photo}
                      alt={user.username || "Avatar"}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <User className="w-5 h-5" />
                  )}
                </div>
                {user.isOnline && (
                  <span className="w-3 h-3 bg-green-500 rounded-full border-2 border-white absolute bottom-0 right-0" />
                )}
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="font-semibold text-gray-800">
                  {user.username}
                </span>

                <div className="flex items-center justify-between gap-2 w-full mt-0.5">
                  <span
                    className={`text-sm truncate ${
                      (user.unreadCount ?? 0) > 0 || showNewMatch(user)
                        ? "text-gray-900 font-semibold"
                        : "text-gray-400"
                    }`}
                  >
                    {(user.unreadCount ?? 0) > 1
                      ? `${user.unreadCount} nouveaux messages`
                      : getPreview(user)}
                  </span>

                  {(user.unreadCount ?? 0) > 0 && (
                    <span className=" flex items-center justify-center w-2 h-2 bg-orange-500 rounded-full "/>
                  )}
                </div>
                <span className="text-sm text-gray-400">
                </span>
              </div>
            </div>
          ))}
        </div>
        <BlockedUsers users={blockedUsers} />
      </div>
    </>
  );
}
