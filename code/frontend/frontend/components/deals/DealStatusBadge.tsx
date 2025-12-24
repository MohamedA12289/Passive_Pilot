"use client";

import { Badge } from "@/components/ui/badge";
import type { DealStatus } from "./dealsStore";

const map: Record<DealStatus, { className: string }> = {
  "Lead": { className: "bg-amber-400/10 text-amber-300 border border-amber-400/20" },
  "Contacted": { className: "bg-sky-400/10 text-sky-300 border border-sky-400/20" },
  "Appointment": { className: "bg-purple-400/10 text-purple-300 border border-purple-400/20" },
  "Under Contract": { className: "bg-emerald-400/10 text-emerald-300 border border-emerald-400/20" },
  "In Escrow": { className: "bg-orange-400/10 text-orange-300 border border-orange-400/20" },
  "Closed": { className: "bg-green-400/10 text-green-300 border border-green-400/20" },
  "Dead": { className: "bg-red-400/10 text-red-300 border border-red-400/20" },
};

export default function DealStatusBadge({ status }: { status: DealStatus }) {
  const s = map[status] ?? map["Lead"];
  return <Badge className={s.className}>{status}</Badge>;
}
