'use client'
import { useQueryClient } from "@tanstack/react-query";
import { api } from "@/src/lib/axios";
import { UserConversationType } from "@/src/type/conversation";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { getErrorMessage } from "@/src/lib/errors";
import { useDropdown } from "@/src/hook/useDropdown";
import { Trash } from "lucide-react";


interface ContactProps {
  selectedUser: UserConversationType | null;
  setSelectedUser: (user: UserConversationType | null) => void;
}

export default function Menu({selectedUser, setSelectedUser}: ContactProps)
{
  const queryClient = useQueryClient();
  const router = useRouter();
  const [invalide, setInvalide] = useState("");
  const { ref, isOpen: showMenu, setIsOpen: setShowMenu } = useDropdown();

  if (!selectedUser) return null;


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
            setInvalide(getErrorMessage(error, "Une erreur est survenue, le match n'a pas été supprimé."));
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
        } catch (error) {
          setInvalide(getErrorMessage(error, "Une erreur est survenue, la conversation n'a pas été supprimée."));
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
      } catch (error) {
        setInvalide(getErrorMessage(error, "Une erreur est survenue, l'utilisateur n'a pas été bloqué."));
      }
    }
  };

  const unblockUser = async (userId: number) => {
    try {
      await api.delete(`/match/block/${userId}`);
      queryClient.invalidateQueries({ queryKey: ["matches"] });
      queryClient.invalidateQueries({ queryKey: ["otherUsers"] });
      setShowMenu(false);
    } catch (error) {
      setInvalide(getErrorMessage(error, "Une erreur est survenue, l'utilisateur n'a pas été débloqué."));
    }
  };

  return(
    <div ref={ref} className="relative ml-auto">
      <button
        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition"
        title="Options"
        aria-label="Options de la conversation"
        aria-expanded={showMenu}
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
          {invalide && (
            <p className="text-red-500 px-3 py-2 rounded-lg text-sm mt-3 font-medium">{invalide}</p>
          )}
        </div>
      )}
    </div>
  )
}