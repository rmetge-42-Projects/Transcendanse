import type { TextareaHTMLAttributes } from "react";

export function TextareaField({
  className = "",
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={`w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-950 ${className}`}
      {...props}
    />
  );
}
