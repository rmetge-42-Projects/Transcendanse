import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "@/src/lib/axios";
import { getErrorMessage } from "@/src/lib/errors";
import { UserType } from "@/src/type/user";

// Onglet replie en bas de la liste des conversations : permet de debloquer
export default function BlockedUsers({ users }: { users: UserType[] }) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");

  // Rien a afficher quand personne n'est bloque
  if (users.length === 0) return null;

  const unblockUser = async (userId: number) => {
    setError("");
    try {
      await api.delete(`/match/block/${userId}`);
      queryClient.invalidateQueries({ queryKey: ["matches"] });
      queryClient.invalidateQueries({ queryKey: ["otherUsers"] });
    } catch (err) {
      setError(getErrorMessage(err, "Une erreur est survenue, l'utilisateur n'a pas été débloqué."));
    }
  };

  return (
    <div className="border-t border-gray-200">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-3 text-sm text-gray-500 hover:bg-gray-100/80 transition"
      >
        <span>Utilisateurs bloqués ({users.length})</span>
        <span>{open ? "−" : "+"}</span>
      </button>
      {open && users.map((user) => (
        <div
          key={user.id}
          className="px-4 py-2 flex items-center justify-between gap-2 border-t border-gray-100"
        >
          <span className="text-sm text-gray-700 truncate">{user.username}</span>
          <button
            onClick={() => unblockUser(user.id)}
            className="text-sm text-green-700 font-semibold hover:underline shrink-0"
          >
            Débloquer
          </button>
        </div>
      ))}
      {error && <p className="px-4 pb-2 text-red-500 text-sm">{error}</p>}
    </div>
  );
}