"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import DealStatusBadge from "./DealStatusBadge";
import type { Deal } from "./dealsStore";

export default function DealCard({
  deal,
  onDelete,
}: {
  deal: Deal;
  onDelete: (id: string) => void;
}) {
  return (
    <Card className="p-5 bg-zinc-950/50 border border-zinc-900">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="text-white font-semibold truncate">{deal.title}</div>
            <DealStatusBadge status={deal.status} />
          </div>

          {deal.address ? (
            <div className="mt-1 text-sm text-zinc-300 truncate">{deal.address}</div>
          ) : (
            <div className="mt-1 text-sm text-zinc-500">No address yet</div>
          )}

          <div className="mt-2 text-sm text-zinc-400 flex flex-wrap gap-x-6 gap-y-1">
            <span>ARV: {deal.arv ? `$${deal.arv.toLocaleString()}` : "—"}</span>
            <span>Offer: {deal.offer ? `$${deal.offer.toLocaleString()}` : "—"}</span>
          </div>

          <div className="mt-3 text-xs text-zinc-500">
            Updated: {new Date(deal.updatedAt).toLocaleString()}
          </div>
        </div>

        <div className="shrink-0 flex flex-col gap-2">
          <Button asChild>
            <Link href={`/track-deal?id=${encodeURIComponent(deal.id)}`}>Track</Link>
          </Button>
          <Button variant="destructive" onClick={() => onDelete(deal.id)}>
            Delete
          </Button>
        </div>
      </div>
    </Card>
  );
}
