"use client";
import Navigation from "@/src/display/navigation";
import Bottom from "@/src/display/bottom";
import { UserConversationType } from "@/src/type/conversation";
import { useState } from "react";
import Contact from "@/src/composant/message/contact";
import Discution from "@/src/composant/message/discution";
import ActivityDropdown from "@/src/composant/message/activity";

export default function Message() {
  const [selectedUser, setSelectedUser] = useState<UserConversationType | null>(
    null,
  );

	return (
    <Bottom>
      <div className="max-w-6xl w-full mx-auto my-auto min-h-[75vh] flex flex-col justify-center px-4 pb-16">
        
        <div className="flex justify-end mb-3">
          <ActivityDropdown />
        </div>
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row h-[70vh] w-full border border-gray-200/80">
          <Contact selectedUser={selectedUser} setSelectedUser={setSelectedUser} />
          <Discution key={selectedUser?.userId ?? "empty"} selectedUser={selectedUser} setSelectedUser={setSelectedUser} />
        </div>
      </div>

      <Navigation />
    </Bottom>
  );
}
