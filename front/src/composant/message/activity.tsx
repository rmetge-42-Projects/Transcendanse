"use client";

import { useState } from "react";
import { Activity, X } from "lucide-react";
import { useActivity } from "@/src/hook/useUser";
import { ActivityType } from "@/src/type/activity";

export default function ActivityDropdown() {
  const [isOpen, setIsOpen] = useState(false);

  const {
    data: activities,
    isLoading,
    isError,
  } = useActivity();

  function getActivityText(activity: ActivityType) {
    if (activity.type === "match") {
      return `Vous avez matché avec ${activity.user.username}`;
    }

    if (activity.type === "like_sent") {
      return `Vous avez liké ${activity.user.username}`;
    }

    if (activity.type === "like_received") {
      return `${activity.user.username} vous a liké`;
    }

    return "";
  }

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
            <h2 className="font-bold text-gray-800">
              Activité récente
            </h2>

            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {isLoading && (
              <p className="p-4 text-sm text-gray-400">
                Chargement...
              </p>
            )}

            {isError && (
              <p className="p-4 text-sm text-red-500">
                Impossible de charger l'activité.
              </p>
            )}

            {!isLoading &&
              !isError &&
              (!activities || activities.length === 0) && (
                <p className="p-4 text-sm text-gray-400">
                  Aucune activité pour le moment.
                </p>
              )}

            {activities?.map((activity) => (
              <div
                key={`${activity.type}-${activity.user.id}-${activity.createdAt}`}
                className="px-4 py-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50"
              >
                <p className="text-sm text-gray-800">
                  {getActivityText(activity)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}