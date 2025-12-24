"use client";

import { ReactNode } from "react";
import { Shell } from "@/components/Shell";
import { FlowStepper } from "@/components/FlowStepper";

export function FlowShell({ campaignId, children }: { campaignId: string; children: ReactNode }) {
  return (
    <Shell>
      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-5">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">Campaign Flow</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Step-by-step setup. Save, go back, and continue anytime.
          </p>
        </div>

        <FlowStepper campaignId={campaignId} />

        <div className="mt-6 rounded-2xl border border-zinc-900/70 bg-zinc-950/40 backdrop-blur p-4 sm:p-6">
          {children}
        </div>
      </div>
    </Shell>
  );
}
