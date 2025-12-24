"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { FlowFrame } from "@/components/flow/FlowFrame";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const PROVIDERS = [
  { id: "dealmachine", name: "DealMachine", desc: "Use your DealMachine subscription + API (we’ll wire keys later)." },
  { id: "attom", name: "ATTOM", desc: "Pull property/owner data with flexible filters (API key later)." },
  { id: "manual", name: "Manual Upload", desc: "Upload your own CSV list and work it inside Passive Pilot." },
] as const;

export default function Step3Provider() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [selected, setSelected] = useState<(typeof PROVIDERS)[number]["id"]>("dealmachine");

  return (
    <FlowFrame
      campaignId={id}
      title="Step 3 — Choose lead source"
      subtitle="Pick where your leads come from. You can swap sources later."
    >
      <div className="grid gap-3">
        {PROVIDERS.map((p) => (
          <button
            key={p.id}
            onClick={() => setSelected(p.id)}
            className={cn(
              "text-left rounded-2xl border p-4 transition",
              "border-white/10 bg-black/30 hover:bg-white/5",
              selected === p.id && "border-yellow-400/40 bg-yellow-400/10"
            )}
          >
            <div className="flex items-center justify-between">
              <div className="text-white font-medium">{p.name}</div>
              <div className={cn("text-xs px-2 py-1 rounded-full border",
                selected === p.id ? "border-yellow-400/40 text-yellow-200 bg-yellow-400/10" : "border-white/10 text-white/60 bg-black/30"
              )}>
                {selected === p.id ? "Selected" : "Select"}
              </div>
            </div>
            <div className="mt-2 text-sm text-white/70">{p.desc}</div>
          </button>
        ))}

        <div className="flex items-center justify-between pt-2">
          <Button variant="secondary" onClick={() => router.push(`/campaigns/${id}/flow/2-map`)}>
            Back
          </Button>
          <Button onClick={() => router.push(`/campaigns/${id}/flow/4-filters`)}>
            Next: Filters
          </Button>
        </div>

        <div className="text-xs text-white/50">
          (Provider settings + API keys will be configured later — “PUT API HERE”.)
        </div>
      </div>
    </FlowFrame>
  );
}
