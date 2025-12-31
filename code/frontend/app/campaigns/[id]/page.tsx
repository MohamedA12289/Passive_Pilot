"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { Shell } from "@/components/Shell";
import { Authed } from "@/components/Authed";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Progress } from "@/components/Progress";
import { apiFetch } from "@/lib/api";
import { loadSettings } from "@/lib/storage";
import { parseCsv, pick } from "@/lib/csv";

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

function withQuery(path: string, query: Record<string, any>) {
  const base = path.startsWith("http") ? path : path;
  const url = new URL(base, "http://local"); // base needed for URL to work with relative paths
  Object.entries(query).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    url.searchParams.set(k, String(v));
  });
  // strip the fake origin
  return url.pathname + (url.search ? url.search : "");
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename || "download";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function CampaignPage() {
  const params = useParams<{ id: string }>();
  const campaignId = Number(params.id);

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [q, setQ] = useState("");

  const [leadForm, setLeadForm] = useState({
    address: "",
    city: "",
    state: "",
    zip_code: "",
    owner_name: "",
    phone: "",
  });

  const [popProvider, setPopProvider] = useState<"dealmachine" | "attom" | "repliers">("dealmachine");
  const [popZip, setPopZip] = useState("");
  const [popLimit, setPopLimit] = useState(50);
  const [popResult, setPopResult] = useState<any>(null);

  // CSV import state
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [importing, setImporting] = useState(false);
  const [importPct, setImportPct] = useState(0);
  const [importNote, setImportNote] = useState<string | null>(null);

  async function load() {
    setErr(null);
    try {
      const c = await apiFetch<Campaign>(`/campaigns/${campaignId}`, { auth: true } as any);
      setCampaign(c);

      const leadsPath = withQuery(`/leads/`, { campaign_id: campaignId });
      const ls = await apiFetch<Lead[]>(leadsPath, { auth: true } as any);
      setLeads(ls);
    } catch (e: any) {
      setErr(e?.message || "Failed to load campaign");
    }
  }

  useEffect(() => {
    if (campaignId) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaignId]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return leads;
    return leads.filter((l) => {
      const hay = [l.address, l.city, l.state, l.zip_code, l.owner_name, l.phone, String(l.id)]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(s);
    });
  }, [leads, q]);

  const withPhoneCount = useMemo(() => leads.filter((l) => (l.phone || "").trim()).length, [leads]);

  async function addLead() {
    setBusy(true);
    setErr(null);
    try {
      const path = withQuery(`/leads/`, { campaign_id: campaignId });
      await apiFetch(path, {
        method: "POST",
        auth: true,
        body: JSON.stringify(leadForm),
      } as any);

      setLeadForm({ address: "", city: "", state: "", zip_code: "", owner_name: "", phone: "" });
      await load();
    } catch (e: any) {
      setErr(e?.message || "Add lead failed");
    } finally {
      setBusy(false);
    }
  }

  async function deleteLead(leadId: number) {
    setBusy(true);
    setErr(null);
    try {
      const path = withQuery(`/leads/${leadId}`, { campaign_id: campaignId });
      await apiFetch(path, { method: "DELETE", auth: true } as any);
      await load();
    } catch (e: any) {
      setErr(e?.message || "Delete lead failed");
    } finally {
      setBusy(false);
    }
  }

  async function deleteAllFiltered() {
    if (filtered.length === 0) return;
    const ok = window.confirm(`Delete ${filtered.length} leads (current filter)? This cannot be undone.`);
    if (!ok) return;

    setBusy(true);
    setErr(null);
    try {
      for (const l of filtered) {
        const path = withQuery(`/leads/${l.id}`, { campaign_id: campaignId });
        await apiFetch(path, { method: "DELETE", auth: true } as any);
      }
      await load();
    } catch (e: any) {
      setErr(e?.message || "Bulk delete failed");
    } finally {
      setBusy(false);
    }
  }

  async function exportByZip() {
    setBusy(true);
    setErr(null);
    try {
      // 1) ask backend to generate export
      const res = await apiFetch<{ filename: string; download_url: string }>(
        `/exports/campaigns/${campaignId}/leads-by-zip`,
        { method: "POST", auth: true, body: JSON.stringify({}) } as any
      );

      // 2) download the file
      // if download_url is absolute, apiFetch already handles "http" paths
      const blob = await apiFetch<Blob>(res.download_url, { method: "GET", auth: true } as any);
      // ^ apiFetch returns text/json; so we can’t use apiFetch for blob safely.
      // We'll fetch directly for blob, but keep auth consistent later if api.ts adds apiDownload.

      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("access_token") || localStorage.getItem("token") || ""
          : "";

      const headers = new Headers();
      if (token) headers.set("Authorization", `Bearer ${token}`);

      const url = res.download_url.startsWith("http") ? res.download_url : res.download_url;
      const r = await fetch(url, { headers });
      if (!r.ok) {
        const text = await r.text().catch(() => "");
        throw new Error(`Download ${r.status}: ${text || r.statusText}`);
      }
      const fileBlob = await r.blob();
      downloadBlob(fileBlob, res.filename);
    } catch (e: any) {
      setErr(e?.message || "Export failed");
    } finally {
      setBusy(false);
    }
  }

  async function populateLeads() {
    setBusy(true);
    setErr(null);
    setPopResult(null);
    try {
      const res = await apiFetch(withQuery(`/campaigns/${campaignId}/populate`, {}), {
        method: "POST",
        auth: true,
        body: JSON.stringify({
          provider: popProvider,
          zipcode: popZip.trim() || null,
          limit: popLimit,
        }),
      } as any);

      setPopResult(res);
      await load();
    } catch (e: any) {
      setErr(e?.message || "Populate failed");
    } finally {
      setBusy(false);
    }
  }

  function messagePreview() {
    const s = loadSettings();
    const example = leads.find((l) => (l.phone || "").trim()) || leads[0];
    if (!example) return;

    const tpl = s.smsTemplate + "\n" + s.signature;
    const text = tpl
      .replaceAll("{address}", example.address || "")
      .replaceAll("{city}", example.city || "")
      .replaceAll("{state}", example.state || "")
      .replaceAll("{zip}", example.zip_code || "")
      .replaceAll("{owner}", example.owner_name || "");

    alert(text);
  }

  async function importCsvFile(file: File) {
    setImporting(true);
    setImportPct(0);
    setImportNote(null);
    setErr(null);

    try {
      const text = await file.text();
      const rows = parseCsv(text);

      if (rows.length === 0) {
        setImportNote("No rows found in CSV.");
        return;
      }

      const mapped = rows.map((row) => ({
        address: pick(row, ["address", "property_address", "street", "street_address"]),
        city: pick(row, ["city", "town"]),
        state: pick(row, ["state", "st"]),
        zip_code: pick(row, ["zip", "zipcode", "zip_code", "postal"]),
        owner_name: pick(row, ["owner", "owner_name", "name"]),
        phone: pick(row, ["phone", "phone_number", "mobile", "cell"]),
      }));

      const clean = mapped.filter((m) => Object.values(m).some((v) => (v || "").trim() !== ""));

      if (clean.length === 0) {
        setImportNote("CSV parsed, but no usable lead fields were found. Check headers.");
        return;
      }

      const total = clean.length;
      let created = 0;

      for (let i = 0; i < clean.length; i++) {
        const body = clean[i];
        if (!body.address && !body.phone) continue;

        const path = withQuery(`/leads/`, { campaign_id: campaignId });
        await apiFetch(path, {
          method: "POST",
          auth: true,
          body: JSON.stringify(body),
        } as any);

        created++;
        setImportPct(Math.round(((i + 1) / total) * 100));
      }

      setImportNote(`Imported ${created} leads from CSV.`);
      await load();
    } catch (e: any) {
      setErr(e?.message || "CSV import failed");
    } finally {
      setImporting(false);
      setTimeout(() => setImportPct(0), 800);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <Authed>
      <Shell>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-xl font-semibold">{campaign?.name || "Campaign"}</h1>
            <p className="text-sm text-zinc-400">
              Leads: {leads.length} • With phone: {withPhoneCount}
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant="secondary" disabled={busy} onClick={load}>
              Refresh
            </Button>
            <Button variant="ghost" disabled={leads.length === 0} onClick={messagePreview}>
              Preview template
            </Button>
            <Button variant="primary" disabled={busy} onClick={exportByZip}>
              Export by ZIP
            </Button>
          </div>
        </div>

        {err ? <div className="mt-4 text-sm text-red-400">{err}</div> : null}

        <div className="mt-6 grid gap-4">
          {/* Populate */}
          <div className="rounded-2xl border border-zinc-900 bg-zinc-950 p-4">
            <div className="font-medium mb-3">Populate leads (provider)</div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <div className="mb-1 text-xs text-zinc-400">Provider</div>
                <select
                  className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2 text-sm outline-none focus:border-zinc-600"
                  value={popProvider}
                  onChange={(e) => setPopProvider(e.target.value as any)}
                >
                  <option value="dealmachine">DealMachine</option>
                  <option value="attom">ATTOM</option>
                  <option value="repliers">Repliers</option>
                </select>
              </div>

              <Input label="ZIP (optional)" value={popZip} onChange={(e) => setPopZip(e.target.value)} placeholder="e.g. 23220" />
              <Input label="Limit" type="number" value={popLimit} onChange={(e) => setPopLimit(Number(e.target.value))} />
            </div>

            <div className="mt-3 flex items-center gap-2 flex-wrap">
              <Button variant="primary" disabled={busy} onClick={populateLeads}>
                {busy ? "Running..." : "Populate"}
              </Button>
              <div className="text-xs text-zinc-400">Providers return 0 until APIs are wired.</div>
            </div>

            {popResult ? (
              <div className="mt-3 text-sm text-zinc-200">
                Created: {popResult.created_leads} • Provider: {popResult.provider}
              </div>
            ) : null}
          </div>

          {/* CSV Import */}
          <div className="rounded-2xl border border-zinc-900 bg-zinc-950 p-4">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <div className="font-medium">Import leads from CSV</div>
                <div className="text-sm text-zinc-400">
                  Supported headers: address, city, state, zip/zipcode, owner/owner_name, phone/phone_number.
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  ref={fileRef}
                  type="file"
                  accept=".csv,text/csv"
                  className="text-sm text-zinc-300"
                  disabled={importing || busy}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) importCsvFile(f);
                  }}
                />
                <Button variant="ghost" disabled={importing || busy} onClick={() => fileRef.current?.click()}>
                  Choose file
                </Button>
              </div>
            </div>

            {importing ? (
              <div className="mt-3 space-y-2">
                <div className="text-xs text-zinc-400">Importing... {importPct}%</div>
                <Progress value={importPct} />
              </div>
            ) : null}

            {importNote ? <div className="mt-3 text-sm text-zinc-200">{importNote}</div> : null}
          </div>

          {/* Manual lead */}
          <div className="rounded-2xl border border-zinc-900 bg-zinc-950 p-4">
            <div className="font-medium mb-3">Add lead (manual)</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Input label="Address" value={leadForm.address} onChange={(e) => setLeadForm({ ...leadForm, address: e.target.value })} />
              <Input label="City" value={leadForm.city} onChange={(e) => setLeadForm({ ...leadForm, city: e.target.value })} />
              <Input label="State" value={leadForm.state} onChange={(e) => setLeadForm({ ...leadForm, state: e.target.value })} />
              <Input label="ZIP" value={leadForm.zip_code} onChange={(e) => setLeadForm({ ...leadForm, zip_code: e.target.value })} />
              <Input label="Owner" value={leadForm.owner_name} onChange={(e) => setLeadForm({ ...leadForm, owner_name: e.target.value })} />
              <Input label="Phone" value={leadForm.phone} onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })} />
            </div>
            <div className="mt-3">
              <Button variant="primary" disabled={busy} onClick={addLead}>
                Add lead
              </Button>
            </div>
          </div>
        </div>

        {/* Leads table */}
        <div className="mt-6">
          <div className="flex items-end justify-between gap-3 flex-wrap mb-3">
            <div>
              <div className="font-medium">Leads</div>
              <div className="text-sm text-zinc-400">Search + bulk delete on current filter.</div>
            </div>
            <div className="flex items-end gap-2 flex-wrap">
              <div className="w-full md:w-72">
                <Input label="Search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="address, owner, phone, zip..." />
              </div>
              <Button variant="danger" disabled={busy || filtered.length === 0} onClick={deleteAllFiltered}>
                Delete filtered
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-zinc-900">
            <table className="min-w-[900px] w-full text-sm">
              <thead className="bg-zinc-950">
                <tr className="text-left text-zinc-400">
                  <th className="p-3 border-b border-zinc-900">Address</th>
                  <th className="p-3 border-b border-zinc-900">City</th>
                  <th className="p-3 border-b border-zinc-900">State</th>
                  <th className="p-3 border-b border-zinc-900">ZIP</th>
                  <th className="p-3 border-b border-zinc-900">Owner</th>
                  <th className="p-3 border-b border-zinc-900">Phone</th>
                  <th className="p-3 border-b border-zinc-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td className="p-4 text-zinc-400" colSpan={7}>
                      No leads match your filter.
                    </td>
                  </tr>
                ) : (
                  filtered.map((l) => (
                    <tr key={l.id} className="border-b border-zinc-900/60 hover:bg-zinc-950/40">
                      <td className="p-3 text-zinc-100">{l.address || "—"}</td>
                      <td className="p-3 text-zinc-200">{l.city || "—"}</td>
                      <td className="p-3 text-zinc-200">{l.state || "—"}</td>
                      <td className="p-3 text-zinc-200">{l.zip_code || "—"}</td>
                      <td className="p-3 text-zinc-200">{l.owner_name || "—"}</td>
                      <td className="p-3 text-zinc-200">{l.phone || "—"}</td>
                      <td className="p-3">
                        <Button variant="danger" disabled={busy} onClick={() => deleteLead(l.id)}>
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-2 text-xs text-zinc-500">
            Tip: If you plan to import thousands, we’ll add a backend bulk import endpoint later for speed.
          </div>
        </div>
      </Shell>
    </Authed>
  );
}
