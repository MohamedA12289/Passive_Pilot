"use client";

import { RequireAuth } from "@/components/RequireAuth";
import { Shell } from "@/components/Shell";

export default function BillingCancel() {
  return (
    <RequireAuth>
      <Shell>
        <h1 className="text-xl font-semibold">Checkout canceled</h1>
        <p className="mt-2 text-sm text-zinc-400">You can restart checkout anytime from Billing.</p>
        <div className="mt-4">
          <a href="/billing" className="px-3 py-2 rounded-xl text-sm bg-zinc-800 hover:bg-zinc-700">Back to Billing</a>
        </div>
      </Shell>
    </RequireAuth>
  );
}
