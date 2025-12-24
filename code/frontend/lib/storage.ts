export const TOKEN_KEY = "pp_token";
export const SETTINGS_KEY = "pp_settings_v1";

export type AppSettings = {
  brandName: string;
  smsTemplate: string;
  signature: string;
  logoMode: "letter" | "image";
};

export const DEFAULT_SETTINGS: AppSettings = {
  brandName: "Passive Pilot",
  smsTemplate: "Hey {owner}, I’m reaching out about {address} in {city}. Interested in an offer?",
  signature: "- Passive Pilot",
  logoMode: "letter",
};

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}
export function setToken(token: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TOKEN_KEY, token);
}
export function clearToken() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_KEY);
}

export function loadSettings(): AppSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  const raw = window.localStorage.getItem(SETTINGS_KEY);
  if (!raw) return DEFAULT_SETTINGS;
  try {
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(s: AppSettings) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
}
