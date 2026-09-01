"use client";
import Navigation from "@/src/display/navigation";
import Bottom from "@/src/display/bottom";
import { User } from "lucide-react";
import { conversation } from "@/src/hook/conversation";

export default function Message() {
//   const users = [
//     { id: 1, name: "Sophie" },
//     { id: 2, name: "Alexandre" },
//     { id: 3, name: "Camille" },
//     { id: 4, name: "Lucas" },
//     { id: 5, name: "Léa" },
//   ];

  const { data: users, isLoading, isError,} = conversation();  

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
              {users.userId(() => (
                <div
                  key={users.name}
                  className="p-4 border-b border-gray-100 flex items-center gap-3 hover:bg-gray-100/80 cursor-pointer transition"
                >
                  <div className="w-10 h-10 rounded-full bg-blue-950 flex items-center justify-center text-white font-bold">
                    <User className="w-5 h-5" />
                  </div>
                  <span className="font-semibold text-gray-800">{user.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Page blanche à droite */}
          <div className="flex-1 bg-white flex items-center justify-center text-gray-400">
            Discussion
          </div>

        </div>
      </div>

      <Navigation />
    </Bottom>
  );
}