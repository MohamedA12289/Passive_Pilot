"use client";

export type DealStatus =
  | "Lead"
  | "Contacted"
  | "Appointment"
  | "Under Contract"
  | "In Escrow"
  | "Closed"
  | "Dead";

export type Deal = {
  id: string;
  title: string;
  address?: string;
  arv?: number;
  offer?: number;
  status: DealStatus;
  notes?: string;
  createdAt: number;
  updatedAt: number;
};

const KEY = "pp_deals_v1";

function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function listDeals(): Deal[] {
  if (typeof window === "undefined") return [];
  const parsed = safeParse<Deal[]>(window.localStorage.getItem(KEY));
  return Array.isArray(parsed) ? parsed : [];
}

export function saveDeals(items: Deal[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(items));
}

export function upsertDeal(input: Omit<Deal, "updatedAt"> & { updatedAt?: number }): Deal {
  const now = Date.now();
  const deal: Deal = { ...input, updatedAt: input.updatedAt ?? now };
  const items = listDeals();
  const idx = items.findIndex((d) => d.id === deal.id);
  const next = idx >= 0 ? [...items.slice(0, idx), deal, ...items.slice(idx + 1)] : [deal, ...items];
  saveDeals(next);
  return deal;
}

export function deleteDeal(id: string) {
  const items = listDeals();
  saveDeals(items.filter((d) => d.id !== id));
}

export function seedDealsIfEmpty() {
  const items = listDeals();
  if (items.length) return;

  const now = Date.now();
  const seeded: Deal[] = [
    {
      id: "deal-1001",
      title: "Townhome — Quick Flip",
      address: "123 Example St, Richmond, VA",
      arv: 325000,
      offer: 210000,
      status: "Lead",
      notes: "Owner open to creative terms. Pull comps.",
      createdAt: now - 1000 * 60 * 60 * 24 * 2,
      updatedAt: now - 1000 * 60 * 60 * 24 * 2,
    },
    {
      id: "deal-1002",
      title: "Brick Ranch — Wholesale",
      address: "88 Sample Ave, Norfolk, VA",
      arv: 280000,
      offer: 175000,
      status: "Under Contract",
      notes: "Inspection scheduled. Assign buyer list.",
      createdAt: now - 1000 * 60 * 60 * 24 * 7,
      updatedAt: now - 1000 * 60 * 60 * 24 * 1,
    },
  ];

  saveDeals(seeded);
}
