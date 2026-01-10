"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import * as React from "react";
import Shell from "@/components/Shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

type AnalyzeRequest = {
  address: string;
  arv?: number;
  rehab?: number;
  assignmentFee?: number;
  notes?: string;
};

type AnalyzeResponse = {
  ok: boolean;
  summary: string;
  metrics?: Record<string, number | string | null>;
  comps?: Array<{ address: string; price?: number; distanceMiles?: number }>;
  errors?: string[];
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

function numOrUndef(v: string): number | undefined {
  const t = v.trim();
  if (!t) return undefined;
  const n = Number(t);
  return Number.isFinite(n) ? n : undefined;
}

export default function Page() {
  const [address, setAddress] = React.useState("");
  const [arv, setArv] = React.useState("");
  const [rehab, setRehab] = React.useState("");
  const [assignmentFee, setAssignmentFee] = React.useState("");
  const [notes, setNotes] = React.useState("");

  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState<AnalyzeResponse | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  async function onAnalyze() {
    setError(null);
    setResult(null);

    const payload: AnalyzeRequest = {
      address: address.trim(),
      arv: numOrUndef(arv),
      rehab: numOrUndef(rehab),
      assignmentFee: numOrUndef(assignmentFee),
      notes: notes.trim() || undefined,
    };

    if (!payload.address) {
      setError("Enter an address (street + city/state or ZIP).");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/analyzer/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Analyze failed (${res.status}): ${txt}`);
      }

      const data = (await res.json()) as AnalyzeResponse;
      setResult(data);
    } catch (e: any) {
      setError(e?.message ?? "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Shell>
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex items-start justify-between gap-6 flex-wrap">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Deal Analyzer</h1>
            <p className="text-sm text-zinc-400 mt-2">
              Run a quick analysis. (API is a placeholder until we wire ATTOM/DealMachine/RentCast.)
            </p>
          </div>
          <Badge className="bg-zinc-900 text-zinc-200 border border-zinc-800">Premium</Badge>
        </div>

        <Separator className="my-6" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-5 bg-zinc-950/40 border border-zinc-900">
            <h2 className="font-semibold">Property inputs</h2>
            <p className="text-sm text-zinc-400 mt-1">Start with an address. Add numbers if you already got them.</p>

            <div className="mt-5 grid gap-3">
              <label className="grid gap-1">
                <span className="text-xs text-zinc-400">Address</span>
                <Input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="123 Main St, Fairfax, VA 22030"
                />
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <label className="grid gap-1">
                  <span className="text-xs text-zinc-400">ARV (optional)</span>
                  <Input value={arv} onChange={(e) => setArv(e.target.value)} placeholder="350000" inputMode="numeric" />
                </label>
                <label className="grid gap-1">
                  <span className="text-xs text-zinc-400">Rehab (optional)</span>
                  <Input value={rehab} onChange={(e) => setRehab(e.target.value)} placeholder="45000" inputMode="numeric" />
                </label>
                <label className="grid gap-1">
                  <span className="text-xs text-zinc-400">Assignment fee (optional)</span>
                  <Input
                    value={assignmentFee}
                    onChange={(e) => setAssignmentFee(e.target.value)}
                    placeholder="15000"
                    inputMode="numeric"
                  />
                </label>
              </div>

              <label className="grid gap-1">
                <span className="text-xs text-zinc-400">Notes (optional)</span>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any special context…"
                  className="min-h-[100px]"
                />
              </label>

              <div className="flex items-center gap-3 pt-2">
                <Button onClick={onAnalyze} disabled={loading}>
                  {loading ? "Analyzing…" : "Analyze"}
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setAddress("");
                    setArv("");
                    setRehab("");
                    setAssignmentFee("");
                    setNotes("");
                    setError(null);
                    setResult(null);
                  }}
                  disabled={loading}
                >
                  Clear
                </Button>
              </div>

              {error && <p className="text-sm text-red-400 mt-2">{error}</p>}
            </div>
          </Card>

          <Card className="p-5 bg-zinc-950/40 border border-zinc-900">
            <h2 className="font-semibold">Results</h2>
            <p className="text-sm text-zinc-400 mt-1">We’ll show metrics + comps once backend is connected.</p>

            <div className="mt-5">
              {!result && !error && (
                <div className="text-sm text-zinc-500">
                  Run an analysis to see the output here.
                </div>
              )}

              {result && (
                <div className="grid gap-4">
                  <Card className="p-4 bg-zinc-950 border border-zinc-900">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-sm text-zinc-400">Summary</div>
                        <div className="mt-1 text-base">{result.summary || "—"}</div>
                      </div>
                      <Badge className="bg-amber-400/10 text-amber-300 border border-amber-400/20">
                        {result.ok ? "OK" : "Review"}
                      </Badge>
                    </div>
                  </Card>

                  {result.metrics && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {Object.entries(result.metrics).map(([k, v]) => (
                        <Card key={k} className="p-3 bg-zinc-950 border border-zinc-900">
                          <div className="text-xs text-zinc-400">{k}</div>
                          <div className="mt-1 text-sm">{String(v ?? "—")}</div>
                        </Card>
                      ))}
                    </div>
                  )}

                  {result.comps?.length ? (
                    <Card className="p-4 bg-zinc-950 border border-zinc-900">
                      <div className="text-sm text-zinc-400 mb-2">Comps</div>
                      <div className="grid gap-2">
                        {result.comps.map((c, idx) => (
                          <div key={idx} className="flex items-center justify-between gap-4 text-sm">
                            <span className="text-zinc-200">{c.address}</span>
                            <span className="text-zinc-400">
                              {c.price ? `$${c.price.toLocaleString()}` : "—"}{" "}
                              {typeof c.distanceMiles === "number" ? `• ${c.distanceMiles.toFixed(2)} mi` : ""}
                            </span>
                          </div>
                        ))}
                      </div>
                    </Card>
                  ) : null}

                  {result.errors?.length ? (
                    <Card className="p-4 bg-zinc-950 border border-zinc-900">
                      <div className="text-sm text-zinc-400 mb-2">Notes</div>
                      <ul className="list-disc pl-5 text-sm text-zinc-300">
                        {result.errors.map((x, i) => (
                          <li key={i}>{x}</li>
                        ))}
                      </ul>
                    </Card>
                  ) : null}
                </div>
              )}
            </div>
          </Card>
        </div>

        <p className="text-xs text-zinc-500 mt-6">
          Backend endpoint expected: <span className="text-zinc-300">POST {API_BASE}/analyzer/analyze</span>
        </p>
      </div>
    </Shell>
  );
}
