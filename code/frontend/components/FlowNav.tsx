"use client";

import { useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { FLOW_STEPS } from "@/components/FlowStepper";

export default function FlowNav({
  campaignId,
  backKey,
  nextKey,
  nextLabel,
}: {
  campaignId: string;
  backKey?: string;
  nextKey?: string;
  nextLabel?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const computed = useMemo(() => {
    const idx = FLOW_STEPS.findIndex((s) => pathname?.includes(`/flow/${s.key}`));
    const prev = idx > 0 ? FLOW_STEPS[idx - 1] : null;
    const next = idx >= 0 && idx < FLOW_STEPS.length - 1 ? FLOW_STEPS[idx + 1] : null;
    return { prev, next };
  }, [pathname]);

  const backHref = backKey ? `/campaigns/${campaignId}/flow/${backKey}` : computed.prev?.href(campaignId);
  const nextHref = nextKey ? `/campaigns/${campaignId}/flow/${nextKey}` : computed.next?.href(campaignId);

  return (
    <div className="flex items-center justify-between gap-3">
      <button
        type="button"
        onClick={() => (backHref ? router.push(backHref) : router.back())}
        className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-100 hover:bg-white/10"
      >
        Back
      </button>

      <button
        type="button"
        onClick={() => nextHref && router.push(nextHref)}
        className="rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-sm text-zinc-100 hover:bg-white/15 disabled:opacity-60"
        disabled={!nextHref}
      >
        {nextLabel || "Next"}
      </button>
    </div>
  );
}
