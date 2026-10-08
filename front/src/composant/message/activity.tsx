"use client";

import { useState } from "react";
import { Activity, X } from "lucide-react";
import { useActivity } from "@/src/hook/useUser";
import { ActivityType } from "@/src/type/activity";

function getActivityDisplay(activity: ActivityType) {
  const username = activity.user.username ?? "un utilisateur";

  if (activity.type === "match") {
    return {
      emoji: "💞",
      text: `Vous avez matché avec ${username}`,
      color: "bg-rose-50 text-rose-600",
    };
  }
  
  if (activity.type === "like_sent") {
    return {
      emoji: "🩷",
      text: `Vous avez liké ${username}`,
      color: "bg-orange-50 text-orange-600",
    };
  }
  
  if (activity.type === "like_received") {
    return {
      emoji: "💝",
      text: `${username} vous a liké`,
      color: "bg-blue-50 text-blue-700",
    };
  }
  
  return {
    emoji: "🔔",
    text: "Nouvelle activité",
    color: "bg-gray-50 text-gray-600",
  };
}

export default function ActivityDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: activities, isLoading, isError } = useActivity();

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-blue-950 text-white rounded-full hover:bg-blue-900 transition"
      >
        <Activity className="w-4 h-4" />
        Activité
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-xl border border-gray-200 z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
            <h2 className="font-bold text-gray-800">Activité récente</h2>

            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {isLoading && (
              <p className="p-4 text-sm text-gray-400">Chargement...</p>
            )}

            {isError && (
              <p className="p-4 text-sm text-red-500">
                Impossible de charger l'activité.
              </p>
            )}

            {!isLoading && !isError && (!activities || activities.length === 0) && (
              <p className="p-4 text-sm text-gray-400">
                Aucune activité pour le moment.
              </p>
            )}

            {activities?.map((activity) => {
              const display = getActivityDisplay(activity);

              return (
                <div
                  key={`${activity.type}-${activity.user.id}-${activity.createdAt}`}
                  className="px-4 py-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-lg ${display.color}`}
                    >
                      {display.emoji}
                    </div>

                    <p className="text-sm text-gray-800 font-medium">
                      {display.text}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}