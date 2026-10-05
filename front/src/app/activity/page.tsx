'use client';

import { useActivity } from '@/src/hook/useUser';
import { ActivityType } from '@/src/type/activity';

export default function ActivityPage() {
  const { data: activities, isLoading, isError } = useActivity();

  function getActivityText(activity: ActivityType) {
    if (activity.type === 'match') {
      return `Vous avez matché avec ${activity.user.username}`;
    }

    if (activity.type === 'like_sent') {
      return `Vous avez liké ${activity.user.username}`;
    }

    if (activity.type === 'like_received') {
      return `${activity.user.username} vous a liké`;
    }
  }

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
    <div>
      <h1>Activité</h1>

      {activities.map((activity) => (
        <div key={`${activity.type}-${activity.user.id}-${activity.createdAt}`}>
          {getActivityText(activity)}
        </div>
      ))}
    </div>
  );
}