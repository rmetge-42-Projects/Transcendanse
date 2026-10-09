"use client";

import { Heart, HeartPlus, UsersRound, Bell } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useActivity } from "@/src/hook/useUser";
import { ActivityType } from "@/src/type/activity";

function getActivityDisplay(activity: ActivityType): {
  Icon: LucideIcon;
  text: string;
  color: string;
} {
  const username = activity.user.username ?? "un utilisateur";

  if (activity.type === "match") {
    return {
      Icon: UsersRound,
      text: `Vous avez matché avec ${username}`,
      color: "bg-rose-100 text-rose-700 border-rose-200",
    };
  }
  
  if (activity.type === "like_sent") {
    return {
      Icon: Heart,
      text: `Vous avez liké ${username}`,
      color: "bg-red-50 text-red-600 border-red-100",
    };
  }
  
  if (activity.type === "like_received") {
    return {
      Icon: HeartPlus,
      text: `${username} vous a liké`,
      color: "bg-pink-100 text-pink-700 border-pink-200",
    };
  }

  return {
    Icon: Bell,
    text: "Nouvelle activité",
    color: "bg-rose-50 text-rose-500 border-rose-100",
  };
}

export default function ActivityPage() {
  const { data: activities, isLoading, isError } = useActivity();

  if (isLoading) {
    return <div>Chargement...</div>;
  }

  if (isError) {
    return <div>Erreur lors du chargement des activités.</div>;
  }

  if (!activities || activities.length === 0) {
    return <div>Aucune activité.</div>;
  }

  return (
    <div className="p-4 flex flex-col gap-4">
      <h1 className="text-2xl font-bold text-blue-950">Activité</h1>

      <div className="flex flex-col gap-3">
        {activities.map((activity) => {
          const display = getActivityDisplay(activity);
          const Icon = display.Icon;

          return (
            <div
              key={`${activity.type}-${activity.user.id}-${activity.createdAt}`}
              className="flex items-center gap-3 bg-white border border-gray-100 rounded-2xl px-4 py-3 shadow-sm"
            >
              <div
                className={`w-10 h-10 rounded-full border flex items-center justify-center ${display.color}`}
              >
                <Icon className="w-5 h-5" />
              </div>

              <p className="text-sm text-gray-800 font-medium">
                {display.text}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}