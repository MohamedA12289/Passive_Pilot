"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { FlowFrame } from "@/components/flow/FlowFrame";
import { Button } from "@/components/ui/button";

type Lead = { id: string; address: string; city: string; state: string; zip: string; };

const MOCK: Lead[] = [
  { id: "1", address: "123 Main St", city: "Richmond", state: "VA", zip: "23220" },
  { id: "2", address: "88 Oak Ave", city: "Henrico", state: "VA", zip: "23228" },
  { id: "3", address: "41 River Rd", city: "Richmond", state: "VA", zip: "23224" },
];

export default function Step5Preview() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);

  async function pull() {
    setLoading(true);
    try {
      // Placeholder until APIs are wired
      await new Promise((r) => setTimeout(r, 600));
      setLeads(MOCK);
    } finally {
      setLoading(false);
    }
  }

  return (
    <FlowFrame
      campaignId={id}
      title="Step 5 — Pull & preview leads"
      subtitle="This is a preview screen. Once APIs are wired, this will pull real leads with your filters."
    >
      <div className="grid gap-4">
        <div className="flex items-center gap-3">
          <Button onClick={pull} disabled={loading}>
            {loading ? "Pulling..." : "Pull Leads (Preview)"}
          </Button>
          <div className="text-sm text-white/60">{leads.length ? `${leads.length} leads loaded` : "No leads yet"}</div>
        </div>

        <div className="rounded-2xl border border-white/10 overflow-hidden">
          <div className="grid grid-cols-12 gap-0 bg-black/40 px-4 py-2 text-xs text-white/60">
            <div className="col-span-6">Address</div>
            <div className="col-span-3">City</div>
            <div className="col-span-1">State</div>
            <div className="col-span-2">ZIP</div>
          </div>
          {leads.length ? (
            <div className="divide-y divide-white/10">
              {leads.map((l) => (
                <div key={l.id} className="grid grid-cols-12 px-4 py-3 text-sm text-white/85">
                  <div className="col-span-6">{l.address}</div>
                  <div className="col-span-3">{l.city}</div>
                  <div className="col-span-1">{l.state}</div>
                  <div className="col-span-2">{l.zip}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-4 py-10 text-center text-white/50 text-sm">
              Pull leads to see a preview here.
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-2">
          <Button variant="secondary" onClick={() => router.push(`/campaigns/${id}/flow/4-filters`)}>
            Back
          </Button>
          <Button onClick={() => router.push(`/campaigns/${id}/flow/6-score`)}>
            Next: Score
          </Button>
        </div>
      </div>
    </FlowFrame>
  );
}
