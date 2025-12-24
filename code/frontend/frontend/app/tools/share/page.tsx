"use client";

import * as React from "react";
import Shell from "@/components/Shell";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getAnalysis, newId, upsertAnalysis } from "@/components/analysis/analysisStore";

export default function Page() {
  const [id, setId] = React.useState("");
  const [msg, setMsg] = React.useState<string | null>(null);

  function copy(url: string) {
    navigator.clipboard?.writeText(url).then(() => {
      setMsg("Link copied.");
      setTimeout(() => setMsg(null), 1500);
    }).catch(() => {
      setMsg("Could not copy. Select the URL manually.");
    });
  }

  function makeBlank() {
    const newOne = newId();
    upsertAnalysis({
      id: newOne,
      title: `Shared deal ${new Date().toLocaleDateString()}`,
      createdAt: new Date().toISOString(),
      payload: {},
    });
    setId(newOne);
    setMsg("Blank share item created. Add details in Tools → Saved Analyses.");
  }

  const url = typeof window !== "undefined" && id.trim()
    ? `${window.location.origin}/share/${id.trim()}`
    : "";

  return (
    <Shell>
      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="flex items-start justify-between gap-6 flex-wrap">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Share Links</h1>
            <p className="text-sm text-zinc-400 mt-2">
              Generate a clean share page you can send to buyers/partners.
            </p>
          </div>
          <Badge className="bg-zinc-900 text-zinc-200 border border-zinc-800">Tools</Badge>
        </div>

        <Separator className="my-6" />

        <div className="grid gap-6">
          <Card className="p-5 bg-zinc-950/40 border border-zinc-900">
            <h2 className="font-semibold">Open or create a share page</h2>
            <p className="text-sm text-zinc-400 mt-1">
              If you already have a saved analysis ID, paste it. Otherwise create a blank one.
            </p>

            <div className="mt-5 grid gap-3">
              <label className="grid gap-1">
                <span className="text-xs text-zinc-400">Analysis ID</span>
                <Input value={id} onChange={(e) => setId(e.target.value)} placeholder="e.g. 3f2a..." />
              </label>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Button
                  onClick={() => {
                    const t = id.trim();
                    if (!t) {
                      setMsg("Paste an ID first, or create a blank one.");
                      return;
                    }
                    const existing = getAnalysis(t);
                    if (!existing) {
                      setMsg("That ID isn't saved in this browser yet. Create it in Tools → Saved Analyses.");
                      return;
                    }
                    window.location.href = `/share/${t}`;
                  }}
                >
                  Open share
                </Button>

                <Button variant="secondary" onClick={makeBlank}>Create blank</Button>

                {url ? (
                  <Button variant="secondary" onClick={() => copy(url)}>
                    Copy link
                  </Button>
                ) : null}

                <Button asChild variant="secondary">
                  <Link href="/tools/analysis">Go to Saved Analyses</Link>
                </Button>
              </div>

              {url ? (
                <div className="mt-3 text-sm text-zinc-300 break-all">
                  {url}
                </div>
              ) : null}

              {msg ? <p className="text-sm text-zinc-400 mt-2">{msg}</p> : null}
            </div>
          </Card>

          <Card className="p-5 bg-zinc-950/40 border border-zinc-900">
            <h2 className="font-semibold">How sharing works right now</h2>
            <ul className="mt-3 list-disc pl-5 text-sm text-zinc-300 space-y-2">
              <li>Share pages read from your browser's saved analyses (localStorage).</li>
              <li>When we wire backend persistence, these links will work from any device.</li>
              <li>Design matches the old Passive Pilot vibe (dark + gold).</li>
            </ul>
          </Card>
        </div>
      </div>
    </Shell>
  );
}
