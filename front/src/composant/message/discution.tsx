import { UserConversationType } from "@/src/type/conversation";
import { User, Send, Trash } from "lucide-react";
import IfIsLoading from "@/src/constant/ifIsLoaging";
import { api } from "@/src/lib/axios";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { socket } from "@/src/lib/socket";
import { useMessages, useMatches } from "@/src/hook/conversation";
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
  const [showMenu, setShowMenu] = useState(false);

  const { data: users } = useMatches();
    useEffect(() => {
      if (!selectedUser || !users) return;

      const freshUser = users.find((u) => u.id === selectedUser.userId);
      if (freshUser) {
        setSelectedUser({
            ...selectedUser,
            isBlocked: freshUser.isBlocked,
            isActive: freshUser.isActive,
            isOnline: freshUser.isOnline,
        });
      }
  }, [users]);

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
    const confirmLogout = window.confirm("Es-tu sûr de vouloir supprimer ce match ?");
    if (confirmLogout) {
        try {
            await api.delete(`/match/${userId}`);
            queryClient.invalidateQueries({ queryKey: ["matches"] });
            queryClient.invalidateQueries({ queryKey: ["otherUsers"] });
            setSelectedUser(null);
            router.push("/message");
        } catch (error: any) {
            if (error.response?.status === 404) {
                queryClient.invalidateQueries({ queryKey: ["matches"] });
                queryClient.invalidateQueries({ queryKey: ["otherUsers"] });
                setSelectedUser(null);
                router.push("/message");
            } else {
                setInvalide("Une erreur est survenue, le match n'a pas été supprimé.");
            }
        }
    }
  };

  const deleteConversation = async (userId: number) => {
    const confirm = window.confirm("Es-tu sûr de vouloir supprimer cette conversation ?");
    if (confirm) {
      try {
          await api.delete(`/message/conversation/${userId}`);
          queryClient.invalidateQueries({ queryKey: ["discution", userId] });
          setShowMenu(false);
      } catch {
          setInvalide("Une erreur est survenue, la conversation n'a pas été supprimée.");
      }
    }
  };

  const blockUser = async (userId: number) => {
    const confirmBlock = window.confirm("Es-tu sûr de vouloir bloquer cet utilisateur ?");
    if (confirmBlock) {
      try {
          await api.post(`/match/block/${userId}`);
          queryClient.invalidateQueries({ queryKey: ["matches"] });
          queryClient.invalidateQueries({ queryKey: ["otherUsers"] });
          setSelectedUser(null);
          router.push("/message");
      } catch {
          setInvalide("Une erreur est survenue, l'utilisateur n'a pas été bloqué.");
      }
    }
  };

  const unblockUser = async (userId: number) => {
    try {
        await api.delete(`/match/block/${userId}`);
        queryClient.invalidateQueries({ queryKey: ["matches"] });
        queryClient.invalidateQueries({ queryKey: ["otherUsers"] });
        setShowMenu(false);
    } catch {
        setInvalide("Une erreur est survenue, l'utilisateur n'a pas été débloqué.");
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
    <div className="relative ml-auto">
        <button
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition"
            title="Options"
            onClick={() => setShowMenu(!showMenu)}
        >
            <Trash />
        </button>
        {showMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-lg z-50 p-2 flex flex-col gap-1">
                <button
                    onClick={() => deleteConversation(selectedUser.userId)}
                    className="text-left px-3 py-2 rounded-lg hover:bg-gray-100 text-sm text-gray-700"
                >
                    Supprimer la conversation
                </button>
              {selectedUser.isActive !== false && (
                <button
                    onClick={() => deleteMatch(selectedUser.userId)}
                    className="text-left px-3 py-2 rounded-lg hover:bg-red-50 text-sm text-red-600"
                >
                    Supprimer le match
                </button>
              )}
            {selectedUser.isBlocked ? (
                <button
                    onClick={() => unblockUser(selectedUser.userId)}
                    className="text-left px-3 py-2 rounded-lg hover:bg-green-50 text-sm text-green-700 font-semibold"
                >
                    Débloquer cet utilisateur
                </button>
            ) : (
                <button
                    onClick={() => blockUser(selectedUser.userId)}
                    className="text-left px-3 py-2 rounded-lg hover:bg-red-50 text-sm text-red-700 font-semibold"
                >
                    Bloquer cet utilisateur
                </button>
            )}
            </div>
        )}
    </div>
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
      {selectedUser.isActive === false ? (
        <div className="p-4 border-t border-gray-200 text-center text-gray-500 text-sm">
            Vous ne pouvez plus envoyer de message à cet utilisateur.
        </div>
      ) : (
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
                onClick={() => send(selectedUser.userId)}
            >
                <Send className="w-4 h-4" />
            </button>
        </div>
    )}
    </div>
  );
}
