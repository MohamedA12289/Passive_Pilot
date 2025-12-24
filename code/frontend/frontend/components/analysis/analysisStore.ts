"use client";

export type SavedAnalysis = {
  id: string;
  title: string;
  createdAt: string; // ISO
  address?: string;
  summary?: string;
  payload: any; // backend response or custom
};

const LS_KEY = "pp_saved_analyses_v1";

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function listAnalyses(): SavedAnalysis[] {
  if (typeof window === "undefined") return [];
  const items = safeParse<SavedAnalysis[]>(window.localStorage.getItem(LS_KEY), []);
  // newest first
  return items.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
}

export function getAnalysis(id: string): SavedAnalysis | null {
  return listAnalyses().find((x) => x.id === id) ?? null;
}

export function upsertAnalysis(item: SavedAnalysis): void {
  if (typeof window === "undefined") return;
  const items = listAnalyses();
  const idx = items.findIndex((x) => x.id === item.id);
  if (idx >= 0) items[idx] = item;
  else items.push(item);
  window.localStorage.setItem(LS_KEY, JSON.stringify(items));
}

export function deleteAnalysis(id: string): void {
  if (typeof window === "undefined") return;
  const items = listAnalyses().filter((x) => x.id !== id);
  window.localStorage.setItem(LS_KEY, JSON.stringify(items));
}

export function newId(): string {
  // simple uuid-ish without deps
  const s4 = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).slice(1);
  return `${s4()}${s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}`;
}
