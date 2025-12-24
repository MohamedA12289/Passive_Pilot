"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import DealCard from "@/components/deals/DealCard";
import DealTable from "@/components/deals/DealTable";
import { deleteDeal, listDeals, seedDealsIfEmpty, upsertDeal, type Deal, type DealStatus } from "@/components/deals/dealsStore";

function makeId() {
  return `deal-${Math.floor(1000 + Math.random() * 9000)}`;
}

export default function MyDealsPage() {
  const [view, setView] = useState<"cards" | "table">("cards");
  const [q, setQ] = useState("");
  const [title, setTitle] = useState("");
  const [address, setAddress] = useState("");
  const [status, setStatus] = useState<DealStatus>("Lead");
  const [deals, setDeals] = useState<Deal[]>([]);

  function refresh() {
    setDeals(listDeals());
  }

  useEffect(() => {
    seedDealsIfEmpty();
    refresh();
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return deals;
    return deals.filter((d) => (d.title + " " + (d.address ?? "") + " " + d.id).toLowerCase().includes(s));
  }, [deals, q]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-white">My Deals</h1>
          <p className="mt-2 text-zinc-300">Track deals end-to-end (UI placeholder — backend wiring later).</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant={view === "cards" ? "default" : "secondary"} onClick={() => setView("cards")}>
            Cards
          </Button>
          <Button variant={view === "table" ? "default" : "secondary"} onClick={() => setView("table")}>
            Table
          </Button>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="p-5 bg-zinc-950/50 border border-zinc-900 lg:col-span-1">
          <div className="text-white font-semibold">Add deal</div>
          <div className="mt-4 grid gap-3">
            <div>
              <div className="text-xs text-zinc-400 mb-1">Title</div>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Brick Ranch — Wholesale" />
            </div>
            <div>
              <div className="text-xs text-zinc-400 mb-1">Address (optional)</div>
              <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="123 Main St, City, ST" />
            </div>
            <div>
              <div className="text-xs text-zinc-400 mb-1">Status</div>
              <select
                className="w-full h-10 rounded-md bg-zinc-950/60 border border-zinc-800 text-zinc-200 px-3"
                value={status}
                onChange={(e) => setStatus(e.target.value as DealStatus)}
              >
                {(["Lead","Contacted","Appointment","Under Contract","In Escrow","Closed","Dead"] as DealStatus[]).map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <Button
              onClick={() => {
                const now = Date.now();
                const d = upsertDeal({
                  id: makeId(),
                  title: title.trim() || "Untitled deal",
                  address: address.trim() || undefined,
                  status,
                  createdAt: now,
                  updatedAt: now,
                });
                setTitle("");
                setAddress("");
                setStatus("Lead");
                refresh();
              }}
            >
              Add
            </Button>

            <Button
              variant="secondary"
              asChild
            >
              <Link href="/tools">Go to Tools</Link>
            </Button>
          </div>
        </Card>

        <div className="lg:col-span-2">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="text-white font-semibold">All deals</div>
            <div className="w-full sm:w-72">
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search deals…" />
            </div>
          </div>

          {view === "table" ? (
            <div className="mt-4">
              <DealTable deals={filtered} />
            </div>
          ) : (
            <div className="mt-4 grid gap-4">
              {filtered.map((d) => (
                <DealCard
                  key={d.id}
                  deal={d}
                  onDelete={(id) => {
                    deleteDeal(id);
                    refresh();
                  }}
                />
              ))}
              {!filtered.length ? (
                <Card className="p-6 bg-zinc-950/50 border border-zinc-900 text-zinc-500">
                  No deals yet. Add one on the left.
                </Card>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
