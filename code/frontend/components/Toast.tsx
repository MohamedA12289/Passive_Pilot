"use client";

import { useEffect } from "react";

export type ToastState = {
  open: boolean;
  message: string;
  tone?: "neutral" | "good" | "warn" | "bad";
};

export function Toast({ state, onClose }: { state: ToastState; onClose: () => void }) {
  useEffect(() => {
    if (!state.open) return;
    const t = setTimeout(() => onClose(), 2200);
    return () => clearTimeout(t);
  }, [state.open, onClose]);

  if (!state.open) return null;

  const cls =
    state.tone === "good"
      ? "border-green-700 text-green-200"
      : state.tone === "warn"
      ? "border-yellow-700 text-yellow-200"
      : state.tone === "bad"
      ? "border-red-700 text-red-200"
      : "border-zinc-800 text-zinc-200";

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
      <div className={`rounded-2xl border bg-zinc-950 px-4 py-3 shadow-lg ${cls}`}>
        <div className="text-sm">{state.message}</div>
      </div>
    </div>
  );
}
