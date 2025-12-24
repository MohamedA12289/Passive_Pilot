"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SavedAnalysis } from "./analysisStore";

export default function AnalysisCard({
  item,
  onDelete,
}: {
  item: SavedAnalysis;
  onDelete: (id: string) => void;
}) {
  return (
    <Card className="p-5 bg-zinc-950/50 border border-zinc-900">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-white font-semibold truncate">{item.title}</h3>
            <Badge className="bg-amber-400/10 text-amber-300 border border-amber-400/20">Saved</Badge>
          </div>
          {item.address ? (
            <div className="mt-1 text-sm text-zinc-300 truncate">{item.address}</div>
          ) : null}
          {item.summary ? (
            <div className="mt-2 text-sm text-zinc-400 line-clamp-2">{item.summary}</div>
          ) : (
            <div className="mt-2 text-sm text-zinc-500">No summary yet (UI-only placeholder).</div>
          )}

          <div className="mt-3 text-xs text-zinc-500">Created: {new Date(item.createdAt).toLocaleString()}</div>
        </div>

        <div className="shrink-0 flex flex-col gap-2">
          <Button asChild>
            <Link href={`/share/${item.id}`}>Open share</Link>
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              navigator.clipboard?.writeText(`${window.location.origin}/share/${item.id}`).catch(() => {});
            }}
          >
            Copy link
          </Button>
          <Button variant="destructive" onClick={() => onDelete(item.id)}>
            Delete
          </Button>
        </div>
      </div>
    </Card>
  );
}
