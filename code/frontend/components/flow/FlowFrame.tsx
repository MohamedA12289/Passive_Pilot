"use client";

import { ReactNode } from "react";
import { FlowStepper } from "./FlowStepper";

export function FlowFrame({
  campaignId,
  title,
  subtitle,
  children,
}: {
  campaignId: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-[calc(100vh-80px)]">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-yellow-400/30 bg-yellow-400/10 px-3 py-1 text-xs text-yellow-200">
            Passive Pilot • Campaign Flow
          </div>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-2 text-white/70 max-w-2xl">{subtitle}</p>
          ) : null}
          <div className="mt-5">
            <FlowStepper campaignId={campaignId} />
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.03)]">
          {children}
        </div>
      </div>
    </div>
  );
}
