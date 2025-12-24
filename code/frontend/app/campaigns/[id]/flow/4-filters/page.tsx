"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { FlowFrame } from "@/components/flow/FlowFrame";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Step4Filters() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [minEquity, setMinEquity] = useState("20");
  const [absentee, setAbsentee] = useState(true);
  const [vacant, setVacant] = useState(false);
  const [minBeds, setMinBeds] = useState("2");
  const [minBaths, setMinBaths] = useState("1");
  const [yearBuiltMin, setYearBuiltMin] = useState("1950");

  return (
    <FlowFrame
      campaignId={id}
      title="Step 4 — Filters"
      subtitle="Set your quick filters. We’ll use these later when we wire the real lead pull APIs."
    >
      <div className="grid gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-white/80 mb-2">Minimum equity (%)</div>
            <Input value={minEquity} onChange={(e) => setMinEquity(e.target.value)} />
          </div>

          <div>
            <div className="text-sm text-white/80 mb-2">Year built (min)</div>
            <Input value={yearBuiltMin} onChange={(e) => setYearBuiltMin(e.target.value)} />
          </div>

          <div>
            <div className="text-sm text-white/80 mb-2">Beds (min)</div>
            <Input value={minBeds} onChange={(e) => setMinBeds(e.target.value)} />
          </div>

          <div>
            <div className="text-sm text-white/80 mb-2">Baths (min)</div>
            <Input value={minBaths} onChange={(e) => setMinBaths(e.target.value)} />
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <label className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-black/30 px-3 py-2">
            <input type="checkbox" checked={absentee} onChange={(e) => setAbsentee(e.target.checked)} />
            <span className="text-sm text-white/80">Absentee owner</span>
          </label>
          <label className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-black/30 px-3 py-2">
            <input type="checkbox" checked={vacant} onChange={(e) => setVacant(e.target.checked)} />
            <span className="text-sm text-white/80">Vacant</span>
          </label>
        </div>

        <div className="flex items-center justify-between pt-2">
          <Button variant="secondary" onClick={() => router.push(`/campaigns/${id}/flow/3-provider`)}>
            Back
          </Button>
          <Button onClick={() => router.push(`/campaigns/${id}/flow/5-preview`)}>
            Next: Preview
          </Button>
        </div>
      </div>
    </FlowFrame>
  );
}
