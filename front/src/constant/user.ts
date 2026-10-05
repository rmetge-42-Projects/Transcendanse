
export const KIND_LABELS: Record<string, string> = {
  man: "Homme",
  woman: "Femme",
  non_binary: "Autre",
};

export const ORIENTATION_LABELS: Record<string, string> = {
  man: "Homme",
  woman: "Femme",
  all: "N'importe",
};

// Optionnel : Une fonction utilitaire pour sécuriser l'affichage
export const getKindLabel = (kind?: string): string => {
  if (!kind) return "";
  return KIND_LABELS[kind] || kind;
};

export const getOrientationLabel = (orientation?: string): string => {
  if (!orientation) return "";
  return ORIENTATION_LABELS[orientation] || orientation;
};