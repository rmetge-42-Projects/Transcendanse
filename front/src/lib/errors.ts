export function getErrorMessage(error: any, fallback: string): string {
  const status = error?.response?.status;
  const message = error?.response?.data?.message;

  // texte de secours
  if (!status || status >= 500) return fallback;

  // erreur dto
  if (Array.isArray(message)) return message[0];

  // texte derreur detecter
  if (typeof message === "string") return message;

  return fallback;
}