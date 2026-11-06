const TOKEN_KEY = "token";

function clearLegacyLocalToken() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_KEY);
}

export function getAuthToken() {
  if (typeof window === "undefined") return null;

  clearLegacyLocalToken();
  return window.sessionStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token: string) {
  if (typeof window === "undefined") return;

  clearLegacyLocalToken();
  window.sessionStorage.setItem(TOKEN_KEY, token);
}

export function clearAuthToken() {
  if (typeof window === "undefined") return;

  window.sessionStorage.removeItem(TOKEN_KEY);
  clearLegacyLocalToken();
}
