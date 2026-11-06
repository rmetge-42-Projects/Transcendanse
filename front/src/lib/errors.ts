export function getErrorMessage(error: any, fallback: string): string {
  const status = error?.response?.status;
  const message = error?.response?.data?.message;

  if (!status || status >= 500) return fallback;

  if (Array.isArray(message)) return message[0];

  if (typeof message === "string") return message;

  return fallback;
}