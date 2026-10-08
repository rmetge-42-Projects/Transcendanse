"use client";

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

          return (
            <div
              key={`${activity.type}-${activity.user.id}-${activity.createdAt}`}
              className="flex items-center gap-3 bg-white border border-gray-100 rounded-2xl px-4 py-3 shadow-sm"
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${display.color}`}
              >
                {display.emoji}
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