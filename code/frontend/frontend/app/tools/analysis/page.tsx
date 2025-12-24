"use client";

import * as React from "react";
import Shell from "@/components/Shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import AnalysisCard from "@/components/analysis/AnalysisCard";
import { deleteAnalysis, listAnalyses, newId, upsertAnalysis } from "@/components/analysis/analysisStore";

function safeJsonParse(raw: string): { ok: boolean; value?: any; error?: string } {
  const t = raw.trim();
  if (!t) return { ok: true, value: {} };
  try {
    return { ok: true, value: JSON.parse(t) };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "Invalid JSON" };
  }
}

export default function Page() {
  const [items, setItems] = React.useState(() => [] as ReturnType<typeof listAnalyses>);
  const [title, setTitle] = React.useState("");
  const [address, setAddress] = React.useState("");
  const [summary, setSummary] = React.useState("");
  const [payload, setPayload] = React.useState("{}");
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setItems(listAnalyses());
  }, []);

  function refresh() {
    setItems(listAnalyses());
  }

  function onSave() {
    setError(null);
    const parsed = safeJsonParse(payload);
    if (!parsed.ok) {
      setError(parsed.error ?? "Invalid JSON payload.");
      return;
    }
    const id = newId();
    upsertAnalysis({
      id,
      title: title.trim() || `Analysis ${new Date().toLocaleDateString()}`,
      createdAt: new Date().toISOString(),
      address: address.trim() || undefined,
      summary: summary.trim() || undefined,
      payload: parsed.value,
    });
    setTitle("");
    setAddress("");
    setSummary("");
    setPayload("{}");
    refresh();
  }

  return (
    <Shell>
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex items-start justify-between gap-6 flex-wrap">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Saved Analyses</h1>
            <p className="text-sm text-zinc-400 mt-2">
              Save analyzer results and generate share links. (Currently stored in your browser only.)
            </p>
          </div>
          <Badge className="bg-zinc-900 text-zinc-200 border border-zinc-800">Tools</Badge>
        </div>

        <Separator className="my-6" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-5 bg-zinc-950/40 border border-zinc-900">
            <h2 className="font-semibold">Create a saved analysis</h2>
            <p className="text-sm text-zinc-400 mt-1">
              Paste the JSON from the analyzer endpoint later, or just save notes for now.
            </p>

            <div className="mt-5 grid gap-3">
              <label className="grid gap-1">
                <span className="text-xs text-zinc-400">Title</span>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Fairfax deal - quick check" />
              </label>

              <label className="grid gap-1">
                <span className="text-xs text-zinc-400">Address (optional)</span>
                <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="123 Main St, Fairfax, VA 22030" />
              </label>

              <label className="grid gap-1">
                <span className="text-xs text-zinc-400">Summary (optional)</span>
                <Textarea
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Why this deal looks good / what to verify next…"
                  className="min-h-[80px]"
                />
              </label>

              <label className="grid gap-1">
                <span className="text-xs text-zinc-400">Payload JSON (optional)</span>
                <Textarea
                  value={payload}
                  onChange={(e) => setPayload(e.target.value)}
                  placeholder='{"ok":true,"summary":"..."}'
                  className="min-h-[140px] font-mono text-xs"
                />
              </label>

              <div className="flex items-center gap-3 pt-2">
                <Button onClick={onSave}>Save analysis</Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setTitle("");
                    setAddress("");
                    setSummary("");
                    setPayload("{}");
                    setError(null);
                  }}
                >
                  Clear
                </Button>
              </div>

              {error && <p className="text-sm text-red-400 mt-2">{error}</p>}
            </div>
          </Card>

          <div className="grid gap-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-semibold">Your saved items</h2>
              <Button variant="secondary" onClick={refresh}>Refresh</Button>
            </div>

            {items.length === 0 ? (
              <Card className="p-5 bg-zinc-950/40 border border-zinc-900">
                <p className="text-sm text-zinc-400">No saved analyses yet.</p>
                <p className="text-sm text-zinc-500 mt-2">
                  Create one on the left, then click <span className="text-zinc-300">Open share</span> to get a clean share page.
                </p>
              </Card>
            ) : (
              items.map((it) => (
                <AnalysisCard
                  key={it.id}
                  item={it}
                  onDelete={(id) => {
                    deleteAnalysis(id);
                    refresh();
                  }}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </Shell>
  );
}
