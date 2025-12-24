"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import FlowMap from "@/components/FlowMap";
import type { GeocodeResult } from "@/lib/geocode";

function storageKey(campaignId: string) {
  return `passivepilot:campaign:${campaignId}:area`;
}

export default function MapStepPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const campaignId = (params?.id || "") as string;

  const [value, setValue] = useState<GeocodeResult | null>(null);

  useEffect(() => {
    if (!campaignId) return;
    try {
      const raw = localStorage.getItem(storageKey(campaignId));
      if (raw) setValue(JSON.parse(raw));
    } catch {
      // ignore
    }
  }, [campaignId]);

  const canContinue = useMemo(() => !!value, [value]);

  function save() {
    if (!campaignId) return;
    if (!value) return;
    localStorage.setItem(storageKey(campaignId), JSON.stringify(value));
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6">
        <div className="text-sm text-zinc-400">Campaign Flow</div>
        <h1 className="text-2xl md:text-3xl font-semibold text-zinc-100">Step 2: Choose your target area</h1>
        <p className="mt-2 text-zinc-400">
          Search by <span className="text-zinc-200">ZIP, city, or state</span> and we’ll zoom the map for you. You can still pan/zoom manually.
        </p>
      </div>

      <FlowMap
        value={value}
        onChange={(next) => {
          setValue(next);
        }}
      />

      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          onClick={() => router.back()}
          className="rounded-xl border border-zinc-800 bg-zinc-950/60 px-4 py-2 text-zinc-200 hover:bg-zinc-950"
        >
          Back
        </button>

        <div className="flex gap-2">
          <button
            onClick={() => {
              save();
            }}
            disabled={!value}
            className="rounded-xl border border-zinc-800 bg-zinc-950/60 px-4 py-2 text-zinc-200 hover:bg-zinc-950 disabled:opacity-50"
          >
            Save
          </button>

          <button
            onClick={() => {
              save();
              // Step 3 (source/provider) – adjust if your route differs
              router.push(`/campaigns/${campaignId}/flow/3-source`);
            }}
            disabled={!canContinue}
            className="rounded-xl bg-[var(--gold)] px-5 py-2 font-medium text-black hover:opacity-90 disabled:opacity-50"
          >
            Save & Continue
          </button>
        </div>
      </div>

      <div className="mt-4 text-xs text-zinc-500">
        Saved locally for now. When we wire APIs, this will persist to the backend campaign record.
      </div>
    </div>
  );
}
