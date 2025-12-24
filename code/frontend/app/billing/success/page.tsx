"use client";

import { RequireAuth } from "@/components/RequireAuth";
import { Shell } from "@/components/Shell";

export default function BillingSuccess() {
  return (
    <RequireAuth>
      <Shell>
        <h1 className="text-xl font-semibold">Payment successful</h1>
        <p className="mt-2 text-sm text-zinc-400">
          If your access doesn’t update immediately, refresh Billing (Stripe webhooks update status).
        </p>
        <div className="mt-4 flex gap-2">
          <a href="/billing" className="px-3 py-2 rounded-xl text-sm bg-zinc-800 hover:bg-zinc-700">Go to Billing</a>
          <a href="/dashboard" className="px-3 py-2 rounded-xl text-sm bg-white text-black hover:bg-zinc-200">Dashboard</a>
        </div>
      </Shell>
    </RequireAuth>
  );
}
