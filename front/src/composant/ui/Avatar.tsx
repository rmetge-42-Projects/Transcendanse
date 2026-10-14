import { User } from "lucide-react";

export function Avatar({
  src,
  alt = "Avatar",
  size = "md",
}: {
  src?: string | null;
  alt?: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizes = {
    sm: "h-10 w-10",
    md: "h-14 w-14",
    lg: "h-24 w-24",
  };

  return (
    <div
      className={`${sizes[size]} flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-blue-950 text-white shadow-sm`}
    >
      {src ? (
        <img src={src} alt={alt} className="h-full w-full object-cover" />
      ) : (
        <User className={size === "lg" ? "h-12 w-12" : "h-5 w-5"} />
      )}
    </div>
  );
}
