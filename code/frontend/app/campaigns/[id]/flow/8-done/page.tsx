"use client";

import { useParams, useRouter } from "next/navigation";
import { FlowFrame } from "@/components/flow/FlowFrame";
import { Button } from "@/components/ui/button";

export default function Step8Done() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  return (
    <FlowFrame
      campaignId={id}
      title="Step 8 — Done"
      subtitle="Your campaign setup is complete. Next we wire real lead pulling and export."
    >
      <div className="grid gap-4">
        <div className="rounded-2xl border border-yellow-400/30 bg-yellow-400/10 p-4 text-sm text-yellow-100">
          ✅ Flow complete for campaign: <span className="font-mono">{id}</span>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button onClick={() => router.push("/campaigns/new")}>Start another campaign</Button>
          <Button variant="secondary" onClick={() => router.push(`/campaigns/${id}/flow/1-create`)}>Review steps</Button>
        </div>

        <div className="text-xs text-white/50">
          Next: Backend zips to persist campaign state + connect export + hook provider APIs.
        </div>
      </div>
    </FlowFrame>
  );
}
