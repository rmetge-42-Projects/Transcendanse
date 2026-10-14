export function StatusDot({ online }: { online?: boolean }) {
  return (
    <span
      className={`inline-flex h-3 w-3 rounded-full border-2 border-white ${
        online ? "bg-emerald-500" : "bg-gray-300"
      }`}
      title={online ? "En ligne" : "Hors ligne"}
    />
  );
}
