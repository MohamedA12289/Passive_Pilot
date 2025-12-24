"use client";

import { useParams, useRouter } from "next/navigation";
import { FlowFrame } from "@/components/flow/FlowFrame";
import { Button } from "@/components/ui/button";

export default function Step6Score() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  return (
    <FlowFrame
      campaignId={id}
      title="Step 6 — Score & prioritize"
      subtitle="We’ll add real scoring rules later. For now this step is your placeholder for ranking leads."
    >
      <div className="grid gap-4">
        <div className="rounded-2xl border border-white/10 bg-black/30 p-4 text-white/75 text-sm">
          Coming next: score by equity, recency, distress flags, and your own tags (Keep / Pass / Call).
        </div>

        <div className="flex items-center justify-between pt-2">
          <Button variant="secondary" onClick={() => router.push(`/campaigns/${id}/flow/5-preview`)}>
            Back
          </Button>
          <Button onClick={() => router.push(`/campaigns/${id}/flow/7-export`)}>
            Next: Export
          </Button>
        </div>
      </div>
    </FlowFrame>
  );
}
