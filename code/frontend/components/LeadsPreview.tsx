"use client";

import React from "react";
import type { PreviewLead } from "@/lib/flowStore";

export function LeadsPreview({
  leads,
  onToggleKeep,
}: {
  leads: PreviewLead[];
  onToggleKeep: (id: string) => void;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-900/70">
      <table className="w-full text-sm">
        <thead className="bg-zinc-950/70">
          <tr className="text-left text-zinc-300">
            <th className="px-4 py-3">Address</th>
            <th className="px-4 py-3">ZIP</th>
            <th className="px-4 py-3">Owner</th>
            <th className="px-4 py-3">Score</th>
            <th className="px-4 py-3">Keep</th>
          </tr>
        </thead>
        <tbody className="bg-zinc-950/30">
          {leads.map((l) => (
            <tr key={l.id} className="border-t border-white/5 text-zinc-200">
              <td className="px-4 py-3">
                <div className="font-medium">{l.address}</div>
                <div className="text-xs text-zinc-400">
                  {[l.city, l.state].filter(Boolean).join(", ")}
                </div>
              </td>
              <td className="px-4 py-3">{l.zip ?? "-"}</td>
              <td className="px-4 py-3">{l.owner ?? "-"}</td>
              <td className="px-4 py-3">{typeof l.score === "number" ? l.score : "-"}</td>
              <td className="px-4 py-3">
                <button
                  type="button"
                  onClick={() => onToggleKeep(l.id)}
                  className={[
                    "rounded-lg border px-3 py-1 text-xs",
                    l.status === "keep"
                      ? "border-emerald-400/40 bg-emerald-400/15 text-emerald-200"
                      : "border-white/10 bg-white/5 text-zinc-200 hover:bg-white/10",
                  ].join(" ")}
                >
                  {l.status === "keep" ? "Keeping" : "Keep"}
                </button>
              </td>
            </tr>
          ))}
          {leads.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-4 py-6 text-center text-zinc-400">
                No leads yet.
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}
