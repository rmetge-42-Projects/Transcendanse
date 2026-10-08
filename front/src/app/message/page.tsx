"use client";
import Navigation from "@/src/display/navigation";
import Bottom from "@/src/display/bottom";
import { UserConversationType } from "@/src/type/conversation";
import { useState } from "react";
import Contact from "@/src/composant/message/contact";
import Discution from "@/src/composant/message/discution";

export default function Message() {
  const [selectedUser, setSelectedUser] = useState<UserConversationType | null>(
    null,
  );

	return (
    <Bottom>
      {/* Conteneur principal */}
      <div className="max-w-6xl w-full mx-auto my-auto min-h-[75vh] flex flex-col justify-center px-4 pb-16">
        
        {/* Grande boîte blanche divisée en 2 */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row h-[70vh] w-full border border-gray-200/80">
          {/* 1. Colonne de gauche (Contact) */}
          <Contact selectedUser={selectedUser} setSelectedUser={setSelectedUser} />
          {/* 2. Colonne de droite (Discution) */}
          <Discution selectedUser={selectedUser} setSelectedUser={setSelectedUser} />
        </div>
      </div>

      <Navigation />
    </Bottom>
  );
}
