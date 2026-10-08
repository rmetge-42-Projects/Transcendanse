export type ActivityType = {
  type: "match" | "like_sent" | "like_received";

  user: {
    id: number;
    username: string | null;
  };

  createdAt: string;
};