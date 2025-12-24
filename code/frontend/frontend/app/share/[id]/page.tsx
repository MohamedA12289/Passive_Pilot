"use client";

import * as React from "react";
import Shell from "@/components/Shell";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getAnalysis } from "@/components/analysis/analysisStore";

export default function Page() {
  const params = useParams<{ id: string }>();
  const id = (params?.id as string) || "";
  const [item, setItem] = React.useState<any | null>(null);

  React.useEffect(() => {
    if (!id) return;
    setItem(getAnalysis(id));
  }, [id]);

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  return (
    <Shell>
      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="flex items-start justify-between gap-6 flex-wrap">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Shared Analysis</h1>
            <p className="text-sm text-zinc-400 mt-2">
              Clean view for partners/buyers. (Backend persistence coming later.)
            </p>
          </div>
          <Badge className="bg-amber-400/10 text-amber-300 border border-amber-400/20">Share</Badge>
        </div>

        <Separator className="my-6" />

        {!item ? (
          <Card className="p-6 bg-zinc-950/50 border border-zinc-900">
            <h2 className="text-white font-semibold">Not found on this device</h2>
            <p className="text-sm text-zinc-400 mt-2">
              This share link is UI-only right now and reads from saved data in your browser.
              Once we connect the backend, this will load from the server and work for anyone.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/tools/analysis">Go to Saved Analyses</Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href="/analyzer">Run Analyzer</Link>
              </Button>
            </div>
            <div className="mt-6 text-xs text-zinc-500 break-all">ID: {id}</div>
          </Card>
        ) : (
          <div className="grid gap-6">
            <Card className="p-6 bg-zinc-950/50 border border-zinc-900">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="min-w-0">
                  <div className="text-xs text-zinc-500">Passive Pilot • Share</div>
                  <h2 className="mt-2 text-white text-2xl font-semibold truncate">{item.title}</h2>
                  {item.address ? <div className="mt-1 text-zinc-300">{item.address}</div> : null}
                  {item.summary ? <div className="mt-3 text-zinc-300">{item.summary}</div> : null}
                  <div className="mt-4 text-xs text-zinc-500">Created: {new Date(item.createdAt).toLocaleString()}</div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      navigator.clipboard?.writeText(shareUrl).catch(() => {});
                    }}
                  >
                    Copy link
                  </Button>
                  <Button asChild>
                    <Link href="/tools/analysis">Edit / manage</Link>
                  </Button>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-zinc-950/50 border border-zinc-900">
              <h3 className="text-white font-semibold">Details</h3>
              <p className="text-sm text-zinc-400 mt-2">This section will become the polished “deal packet” view.</p>

              <div className="mt-4 grid gap-3">
                <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
                  <div className="text-xs uppercase tracking-wide text-zinc-400">Raw payload (debug)</div>
                  <pre className="mt-2 text-xs text-zinc-200 overflow-auto whitespace-pre-wrap break-words font-mono">
{JSON.stringify(item.payload ?? {}, null, 2)}
                  </pre>
                </div>

                <div className="rounded-xl border border-amber-400/20 bg-amber-400/10 p-4">
                  <div className="text-xs uppercase tracking-wide text-amber-200">Next wiring</div>
                  <ul className="mt-2 list-disc pl-5 text-sm text-amber-100/90 space-y-1">
                    <li>Backend endpoint: GET /share/{id} (public)</li>
                    <li>Signed share tokens + expiration (optional)</li>
                    <li>Printable flyer / PDF export</li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </Shell>
  );
}
