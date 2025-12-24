"use client";

import type { DealStatus } from "./dealsStore";

const steps: DealStatus[] = [
  "Lead",
  "Contacted",
  "Appointment",
  "Under Contract",
  "In Escrow",
  "Closed",
];

export default function DealTimeline({ status }: { status: DealStatus }) {
  const currentIdx = status === "Dead" ? -1 : steps.indexOf(status);

  return (
    <div className="mt-4">
      <div className="text-sm text-zinc-300 mb-2">Progress</div>
      <div className="grid grid-cols-6 gap-2">
        {steps.map((s, i) => {
          const done = currentIdx >= i;
          return (
            <div key={s} className="min-w-0">
              <div
                className={[
                  "h-2 rounded-full border",
                  done
                    ? "bg-yellow-500/50 border-yellow-500/40"
                    : "bg-zinc-900/60 border-zinc-800",
                ].join(" ")}
              />
              <div className={"mt-2 text-[11px] truncate " + (done ? "text-yellow-200" : "text-zinc-500")}>
                {s}
              </div>
            </div>
          );
        })}
      </div>

      {status === "Dead" ? (
        <div className="mt-3 text-sm text-red-300">Marked as Dead.</div>
      ) : null}
    </div>
  );
}
