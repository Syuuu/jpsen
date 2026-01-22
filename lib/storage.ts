export const storageKeys = {
  favorites: "jp-trainer:favorites",
  srs: "jp-trainer:srs",
  ttsSettings: "jp-trainer:tts-settings",
  openedPhrases: "jp-trainer:opened-phrases"
};

export function readStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") {
    return fallback;
  }
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeStorage<T>(key: string, value: T) {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(key, JSON.stringify(value));
}
