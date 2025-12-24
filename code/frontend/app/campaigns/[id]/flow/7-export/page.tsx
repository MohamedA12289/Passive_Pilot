"use client";

import { useParams, useRouter } from "next/navigation";
import { FlowFrame } from "@/components/flow/FlowFrame";
import { Button } from "@/components/ui/button";

export default function Step7Export() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  return (
    <FlowFrame
      campaignId={id}
      title="Step 7 — Export"
      subtitle="Export grouped by ZIP (CSV). Backend wiring comes next — UI is ready."
    >
      <div className="grid gap-4">
        <div className="rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-white/75">
          Export options:
          <ul className="list-disc pl-5 mt-2 text-white/70">
            <li>Grouped by ZIP</li>
            <li>All leads in one CSV</li>
            <li>Include columns for call status & notes</li>
          </ul>
        </div>

        <div className="flex items-center gap-3">
          <Button disabled>Download CSV (Coming after backend)</Button>
          <span className="text-xs text-white/50">We’ll connect this to the backend export endpoint.</span>
        </div>

        <div className="flex items-center justify-between pt-2">
          <Button variant="secondary" onClick={() => router.push(`/campaigns/${id}/flow/6-score`)}>
            Back
          </Button>
          <Button onClick={() => router.push(`/campaigns/${id}/flow/8-done`)}>
            Next: Done
          </Button>
        </div>
      </div>
    </FlowFrame>
  );
}
