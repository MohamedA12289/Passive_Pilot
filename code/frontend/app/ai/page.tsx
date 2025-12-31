"use client";

import { useEffect, useMemo, useState } from "react";
import { Authed } from "@/components/Authed";
import { Shell } from "@/components/Shell";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { apiFetch } from "@/lib/api";

type Campaign = { id: number; name: string; created_at: string };
type Lead = {
  id: number;
  campaign_id: number;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zip_code?: string | null;
  owner_name?: string | null;
  phone?: string | null;
  created_at: string;
};

function render(tpl: string, lead: Lead) {
  return tpl
    .replaceAll("{address}", lead.address || "")
    .replaceAll("{city}", lead.city || "")
    .replaceAll("{state}", lead.state || "")
    .replaceAll("{zip}", lead.zip_code || "")
    .replaceAll("{owner}", lead.owner_name || "");
}

export default function AIPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [campaignId, setCampaignId] = useState<number | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);

  const [persona, setPersona] = useState("Warm, direct, no fluff. Sounds like a real local investor.");
  const [goal, setGoal] = useState("Start a conversation about buying their property.");
  const [tpl, setTpl] = useState("Hey {owner}, I’m reaching out about {address} in {city}. Would you consider an offer?");

  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function loadCampaigns() {
    const cs = await apiFetch<Campaign[]>("/campaigns/", { auth: true });
    setCampaigns(cs);
    if (cs.length && campaignId == null) setCampaignId(cs[0].id);
  }

  async function loadLeads(cid: number) {
    const ls = await apiFetch<Lead[]>("/leads/", { auth: true, query: { campaign_id: cid } });
    setLeads(ls);
  }

  useEffect(() => {
    (async () => {
      try {
        await loadCampaigns();
      } catch (e: any) {
        setErr(e?.message || "Failed to load campaigns");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!campaignId) return;
    (async () => {
      try {
        await loadLeads(campaignId);
      } catch (e: any) {
        setErr(e?.message || "Failed to load leads");
      }
    })();
  }, [campaignId]);

  const sample = useMemo(() => {
    const withPhone = leads.filter((l) => (l.phone || "").trim());
    return (withPhone[0] || leads[0]) ?? null;
  }, [leads]);

  async function generate() {
    if (!sample) return;
    setBusy(true);
    setErr(null);
    try {
      // backend is a placeholder; this will error until you add OPENAI key + endpoint
      const res = await apiFetch<{ message: string }>("/ai/generate-sms", {
        method: "POST",
        auth: true,
      body: JSON.stringify({
  persona,
  goal,
  lead: {
    address: sample.address,
    city: sample.city,
    state: sample.state,
    zip_code: sample.zip_code,
    owner_name: sample.owner_name,
  },
  template: tpl,
}),

      });

      setTpl(res.message);
      // toast
      // @ts-ignore
      if (typeof window !== "undefined" && (window as any).__pp_toast) {
        (window as any).__pp_toast("AI generated a new template", "good");
      }
    } catch (e: any) {
      setErr(e?.message || "AI generate failed");
      // @ts-ignore
      if (typeof window !== "undefined" && (window as any).__pp_toast) {
        (window as any).__pp_toast("AI not configured yet (placeholder)", "warn");
      }
    } finally {
      setBusy(false);
    }
  }

  const preview = sample ? render(tpl, sample) : "";

  return (
    <Authed>
      <Shell>
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-xl font-semibold">AI Assist</h1>
            <p className="text-sm text-zinc-400">Generate SMS templates (placeholder endpoint until API key is added).</p>
          </div>
        </div>

        {err ? <div className="mt-4 text-sm text-red-400">{err}</div> : null}

        <div className="mt-6 grid gap-4">
          <div className="rounded-2xl border border-zinc-900 bg-zinc-950 p-4">
            <div className="font-medium mb-3">Context</div>

            <label className="block text-xs text-zinc-400 mb-1">Campaign</label>
            <select
              className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2 text-sm outline-none focus:border-zinc-600"
              value={campaignId ?? ""}
              onChange={(e) => {
                const v = e.target.value;
                setCampaignId(v ? Number(v) : null);
              }}
            >
              {campaigns.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input label="Persona" value={persona} onChange={(e) => setPersona(e.target.value)} />
              <Input label="Goal" value={goal} onChange={(e) => setGoal(e.target.value)} />
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-900 bg-zinc-950 p-4">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <div className="font-medium">Template</div>
                <div className="text-sm text-zinc-400">Supports: {"{address} {city} {state} {zip} {owner}"}</div>
              </div>
              <Button variant="primary" disabled={busy || !sample} onClick={generate}>
                {busy ? "Generating..." : "Generate with AI"}
              </Button>
            </div>

            <textarea
              className="mt-3 w-full min-h-[140px] rounded-2xl bg-zinc-900 border border-zinc-800 px-3 py-2 text-sm outline-none focus:border-zinc-600"
              value={tpl}
              onChange={(e) => setTpl(e.target.value)}
            />

            <div className="mt-4 rounded-2xl border border-zinc-900 bg-zinc-900/30 p-4">
              <div className="text-xs text-zinc-400 mb-2">Preview (using a sample lead)</div>
              <div className="text-sm whitespace-pre-wrap">{preview || "No leads yet."}</div>
            </div>
          </div>
        </div>
      </Shell>
    </Authed>
  );
}
