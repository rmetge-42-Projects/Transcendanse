import type { ReactNode } from "react";

export function EmptyState({
  icon,
  title,
  children,
}: {
  icon?: ReactNode;
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex min-h-48 flex-col items-center justify-center rounded-lg border border-dashed border-gray-200 bg-white p-8 text-center">
      {icon && <div className="mb-3 text-gray-400">{icon}</div>}
      <h2 className="text-lg font-bold text-gray-900">{title}</h2>
      {children && <p className="mt-2 max-w-md text-sm text-gray-500">{children}</p>}
    </div>
  );
}
