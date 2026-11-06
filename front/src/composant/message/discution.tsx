import { UserConversationType } from "@/src/type/conversation";
import { User, Send, Trash } from "lucide-react";
import IfIsLoading from "@/src/constant/ifIsLoaging";
import { api } from "@/src/lib/axios";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { socket } from "@/src/lib/socket";
import Menu from "@/src/composant/message/menu";

import { useMessages, useMatches } from "@/src/hook/conversation";
import { getErrorMessage } from "@/src/lib/errors";

interface ContactProps {
  selectedUser: UserConversationType | null;
  setSelectedUser: (user: UserConversationType | null) => void;
}
export default function Duiscution({
  selectedUser,
  setSelectedUser,
}: ContactProps) {
  const queryClient = useQueryClient();
  const [messageText, setMessageText] = useState("");
  const [invalide, setInvalide] = useState("");
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);

  const { data: messages, isLoading, isError } = useMessages(selectedUser?.userId);

  const { data: users } = useMatches();

  useEffect(() => {
    if (!selectedUser || !users) return;
    const freshUser = users.find((u) => u.id === selectedUser.userId);
    if (!freshUser) return;

    if (freshUser.isActive === false || freshUser.isBlocked) {
      setSelectedUser(null);
    return;
    }

    setSelectedUser({
      ...selectedUser,
      userName: freshUser.username,
      userPhoto: freshUser.photo !== undefined ? freshUser.photo : selectedUser.userPhoto,
      isBlocked: freshUser.isBlocked,
      isActive: freshUser.isActive,
      isOnline: freshUser.isOnline,
    });
  }, [users]);

  useEffect(() => {
    if (!selectedUser) return;

    socket.on("newMessage", () => {
      queryClient.invalidateQueries({ queryKey: ["discution", selectedUser.userId] });
      queryClient.invalidateQueries({ queryKey: ["messagerie"] });
    });

    return () => {
      socket.off("newMessage");
    };
  }, [selectedUser?.userId]);

  if (!selectedUser) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400">
        Sélectionnez une conversation pour commencer
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className=" min-h-screen flex flex-col justify-between p-8 w-full">
        <IfIsLoading>Chargement de la discution</IfIsLoading>
      </div>
    );
  }

  const send = async (userId: number) => {
    setInvalide("");
    if (!messageText.trim()) return;
    try {
      const res = await api.post("/message/sendMessage", {
        receiveId: userId,
        message: messageText,
      });
      setMessageText("");
      queryClient.invalidateQueries({ queryKey: ["discution", userId] });
    } catch (error) {
      setInvalide(getErrorMessage(error, "Une erreur est survenue, veuillez réessayer."));
    }
  };

  const deleteMessage = async (messageId: number, userId: number) => {
    try {
      await api.delete(`/message/message/${messageId}`);
      queryClient.invalidateQueries({ queryKey: ["discution", userId] });
      queryClient.invalidateQueries({ queryKey: ["matches"] });
    } catch (error) {
      setInvalide(getErrorMessage(error, "Le message n'a pas été supprimé."));
    }
  };

  
  const seeProfileMatch = async (userId: number) => {
    router.push(`/myMatchProfile/${userId}`);
  };

  return (
    <div className="flex-1 flex flex-col bg-white">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div
          onClick={() => seeProfileMatch(selectedUser.userId)}
          className="flex items-center gap-3 cursor-pointer group hover:opacity-85 transition"
          title="Voir le profil du match"
        >
          <div className="relative shrink-0">
            <div className="w-10 h-10 rounded-full bg-blue-950 flex items-center justify-center text-white font-bold overflow-hidden shadow-sm">
              {selectedUser.userPhoto ? (
                <img
                  src={selectedUser.userPhoto}
                  alt={selectedUser.userName || "Avatar"}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <User className="w-5 h-5" />
              )}
            </div>
            {selectedUser.isOnline && (
              <span className="w-3 h-3 bg-green-500 rounded-full border-2 border-white absolute bottom-0 right-0" />
            )}
          </div>
          <div>
            <span className="font-bold text-gray-900 group-hover:text-blue-950 transition-colors block text-base leading-tight">
              {selectedUser.userName}
            </span>
            <span className="text-[11px] text-gray-400 group-hover:text-gray-600 transition-colors">
              Voir le profil
            </span>
          </div>
        </div>
       

        <Menu selectedUser={selectedUser} setSelectedUser={setSelectedUser}/>


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
                <p>{msg.content}</p>
                <div className="flex items-center justify-end gap-2 mt-1">
                  <button
                    onClick={() => deleteMessage(msg.id, selectedUser.userId)}
                    className="opacity-50 hover:opacity-100 transition"
                    title="Supprimer pour moi"
                  >
                    <Trash className="w-3 h-3" />
                  </button>
                  <span
                    className={`text-[10px] ${
                      isMe ? "text-gray-300" : "text-gray-400"
                    }`}
                  >
                    {(() => {
                      const d = new Date(msg.createdAt);
                      return !isNaN(d.getTime())
                        ? d.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : msg.createdAt;
                    })()}
                  </span>
                </div>
              </div>
            );
          })
        ) : !isError ? (
          <p className="text-center text-gray-400 text-sm my-auto">
            Début de votre conversation avec {selectedUser.userName}
          </p>
        ) : null}
      </div>
      {isError && <p role="alert" className="text-red-500 text-sm mt-3 font-medium">Impossible de charger les messages. Réessayez en rouvrant la conversation.</p>}
      {invalide && (
        <p className="text-red-500 text-sm mt-3 font-medium">{invalide}</p>
      )}
      {selectedUser.isActive === false ? (
        <div className="p-4 border-t border-gray-200 text-center text-gray-500 text-sm">
          Vous ne pouvez plus envoyer de message à cet utilisateur.
        </div>
      ) : (
        <div className="p-4 border-t border-gray-200 flex gap-2">
          <input
            type="text"
            placeholder="Écrivez votre message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:border-blue-950 text-gray-700"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                send(selectedUser.userId);
              }
            }}
          />
          <button
            className="bg-blue-950 text-white p-2.5 rounded-full hover:bg-blue-900 transition"
            onClick={() => send(selectedUser.userId)}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
