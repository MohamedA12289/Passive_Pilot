"use client";

import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import { FlowFrame } from "@/components/flow/FlowFrame";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
export default function Step1Create() {
  const params = useParams<{ id: string }>();
  const search = useSearchParams();
  const router = useRouter();
  const campaignId = params.id;

  const initialName = search.get("name") || "New Campaign";
  const [name, setName] = useState(initialName);
  const [notes, setNotes] = useState("");

  return (
    <FlowFrame
      campaignId={campaignId}
      title="Step 1 — Create campaign"
      subtitle="Name it and save the basics. Next we pick the target area on the map."
    >
      <div className="grid gap-4">
        <div>
          <div className="text-sm text-white/80 mb-2">Campaign name</div>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <div className="text-sm text-white/80 mb-2">Notes (optional)</div>
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="What’s the plan for this list?" />
        </div>

        <div className="flex items-center justify-between pt-2">
          <Button variant="secondary" onClick={() => router.push("/campaigns/new")}>
            Back
          </Button>
          <Button onClick={() => router.push(`/campaigns/${campaignId}/flow/2-map`)}>
            Next: Map
          </Button>
        </div>

        <div className="text-xs text-white/50">
          (Saving to backend comes in Backend zip — for now this is UI flow.)
        </div>
      </div>
    </FlowFrame>
  );
}
