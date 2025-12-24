"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import DealStatusBadge from "./DealStatusBadge";
import type { Deal } from "./dealsStore";

export default function DealTable({ deals }: { deals: Deal[] }) {
  return (
    <Card className="p-0 overflow-hidden bg-zinc-950/50 border border-zinc-900">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-zinc-950/70">
            <tr className="text-left text-zinc-300">
              <th className="px-4 py-3">Deal</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">ARV</th>
              <th className="px-4 py-3">Offer</th>
              <th className="px-4 py-3">Updated</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {deals.map((d) => (
              <tr key={d.id} className="border-t border-zinc-900 text-zinc-200">
                <td className="px-4 py-3 min-w-[260px]">
                  <div className="font-semibold text-white truncate">{d.title}</div>
                  <div className="text-xs text-zinc-400 truncate">{d.address ?? d.id}</div>
                </td>
                <td className="px-4 py-3">
                  <DealStatusBadge status={d.status} />
                </td>
                <td className="px-4 py-3">{d.arv ? `$${d.arv.toLocaleString()}` : "—"}</td>
                <td className="px-4 py-3">{d.offer ? `$${d.offer.toLocaleString()}` : "—"}</td>
                <td className="px-4 py-3 text-zinc-400">{new Date(d.updatedAt).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <Link
                    className="text-yellow-200 hover:underline"
                    href={`/track-deal?id=${encodeURIComponent(d.id)}`}
                  >
                    Track →
                  </Link>
                </td>
              </tr>
            ))}
            {!deals.length ? (
              <tr>
                <td className="px-4 py-6 text-zinc-500" colSpan={6}>
                  No deals yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
