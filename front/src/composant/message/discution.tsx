import { UserConversationType } from "@/src/type/conversation";
import { User, Send, Trash } from "lucide-react";
import IfIsLoading from "@/src/constant/ifIsLoaging";
import { api } from "@/src/lib/axios";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { socket } from "@/src/lib/socket";

import { useMessages } from "@/src/hook/conversation";
import MyMatchProfile from "@/src/app/myMatchProfile/[id]/page";

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

  const { data: messages, isLoading } = useMessages(selectedUser?.userId);
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
    } catch {
      if (messageText)
        setInvalide("Une erreur est survenue, veuillez réessayer.");
    }
  };

  const deleteMatch = async (userId: number) => {
    const confirmLogout = window.confirm(
      "Es-tu sûr de vouloir supprimer ce match  ?",
    );
    if (confirmLogout) {
      try {
        const res = await api.delete(`/match/${userId}`);
        queryClient.invalidateQueries({ queryKey: ["messages", userId] });
        queryClient.invalidateQueries({ queryKey: ["messagerie"] });
        setSelectedUser(null);
        router.push("/message");
      } catch {
        setInvalide(
          "Une erreur est survenue, le match n'a pas etais supprimer",
        );
      }
    }
  };

  const seeProfileMatch = async (userId: number) => {
    router.push(`/myMatchProfile/${userId}`);
  };

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Entête du chat */}
      <div className="p-4 border-b border-gray-200 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-blue-950 flex items-center justify-center text-white font-bold">
          <User className="w-5 h-5" />
        </div>
        <span
          onClick={() => seeProfileMatch(selectedUser.userId)}
          className="font-bold text-gray-800"
        >
          {selectedUser.userName}
        </span>
        <button
          className="ml-auto p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition"
          title="Supprimer le match"
          onClick={() => deleteMatch(selectedUser.userId)}
        >
          <Trash />
        </button>
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
                <span
                  className={`text-[10px] block mt-1 text-right ${
                    isMe ? "text-gray-300" : "text-gray-400"
                  }`}
                >
                  {(() => {
                    const d = new Date(msg.createdAt);
                    // Si la date est valide, on formate l'heure, sinon on affiche le texte tel quel
                    return !isNaN(d.getTime())
                      ? d.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : msg.createdAt;
                  })()}
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
      {invalide && (
        <p className="text-red-500 text-sm mt-3 font-medium">{invalide}</p>
      )}
      <div className="p-4 border-t border-gray-200 flex gap-2">
        <input
          type="text"
          placeholder="Écrivez votre message..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:border-blue-950"
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
          // disabled={send}
          onClick={() => send(selectedUser.userId)}
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
