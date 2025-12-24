"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import DealStatusBadge from "@/components/deals/DealStatusBadge";
import DealTimeline from "@/components/deals/DealTimeline";
import { listDeals, upsertDeal, type Deal, type DealStatus } from "@/components/deals/dealsStore";

export default function TrackDealPage() {
  const sp = useSearchParams();
  const initialId = sp.get("id") ?? "";
  const [dealId, setDealId] = useState(initialId);
  const [deal, setDeal] = useState<Deal | null>(null);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const id = initialId;
    if (id) {
      const found = listDeals().find((d) => d.id === id) ?? null;
      setDeal(found);
      setNotes(found?.notes ?? "");
    }
  }, [initialId]);

  const notFound = useMemo(() => dealId && !deal, [dealId, deal]);

  function load() {
    const found = listDeals().find((d) => d.id === dealId) ?? null;
    setDeal(found);
    setNotes(found?.notes ?? "");
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-white">Track Deal</h1>
          <p className="mt-2 text-zinc-300">Paste a deal ID from <Link className="text-yellow-200 hover:underline" href="/my-deals">My Deals</Link>.</p>
        </div>
        <Button asChild variant="secondary">
          <Link href="/my-deals">← Back to My Deals</Link>
        </Button>
      </div>

      <Card className="mt-6 p-5 bg-zinc-950/50 border border-zinc-900">
        <div className="flex items-end gap-3 flex-wrap">
          <div className="flex-1 min-w-[220px]">
            <div className="text-xs text-zinc-400 mb-1">Deal ID</div>
            <Input value={dealId} onChange={(e) => setDealId(e.target.value)} placeholder="deal-1002" />
          </div>
          <Button onClick={load}>Load</Button>
        </div>

        {notFound ? (
          <div className="mt-4 text-sm text-red-300">No deal found for that ID.</div>
        ) : null}
      </Card>

      {deal ? (
        <Card className="mt-4 p-5 bg-zinc-950/50 border border-zinc-900">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="text-white font-semibold text-lg truncate">{deal.title}</div>
                <DealStatusBadge status={deal.status} />
              </div>
              <div className="mt-1 text-sm text-zinc-300">{deal.address ?? "No address"}</div>
              <div className="mt-2 text-sm text-zinc-400 flex flex-wrap gap-x-6 gap-y-1">
                <span>ARV: {deal.arv ? `$${deal.arv.toLocaleString()}` : "—"}</span>
                <span>Offer: {deal.offer ? `$${deal.offer.toLocaleString()}` : "—"}</span>
              </div>
              <DealTimeline status={deal.status} />
            </div>

            <div className="shrink-0">
              <div className="text-xs text-zinc-400 mb-1">Update status</div>
              <select
                className="w-56 h-10 rounded-md bg-zinc-950/60 border border-zinc-800 text-zinc-200 px-3"
                value={deal.status}
                onChange={(e) => {
                  const next = e.target.value as DealStatus;
                  const updated = upsertDeal({ ...deal, status: next, updatedAt: Date.now() });
                  setDeal(updated);
                }}
              >
                {(["Lead","Contacted","Appointment","Under Contract","In Escrow","Closed","Dead"] as DealStatus[]).map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-5">
            <div className="text-xs text-zinc-400 mb-1">Notes</div>
            <textarea
              className="w-full min-h-[120px] rounded-md bg-zinc-950/60 border border-zinc-800 text-zinc-200 p-3"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Call outcome, repairs estimate, buyer interest…"
            />
            <div className="mt-2 flex justify-end">
              <Button
                variant="secondary"
                onClick={() => {
                  const updated = upsertDeal({ ...deal, notes, updatedAt: Date.now() });
                  setDeal(updated);
                }}
              >
                Save notes
              </Button>
            </div>
          </div>
        </Card>
      ) : null}
    </div>
  );
}
