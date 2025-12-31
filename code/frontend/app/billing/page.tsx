"use client";

import { useEffect, useState } from "react";
import { RequireAuth } from "@/components/RequireAuth";
import { Shell } from "@/components/Shell";
import { Button } from "@/components/Button";
import { Badge } from "@/components/Badge";
import { apiFetch } from "@/lib/api";

type Sub = { status: string; current_period_end?: string | null };
type Checkout = { url: string };

export default function BillingPage() {
  const [sub, setSub] = useState<Sub | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    setErr(null);
    try {
      const s = await apiFetch<Sub>("/billing/me", { auth: true });
      setSub(s);
    } catch (e: any) {
      setErr(e.message || "Failed to load subscription");
    }
  }

  useEffect(() => { load(); }, []);

  async function startCheckout() {
    setBusy(true);
    setErr(null);
    try {
     const res = await apiFetch<Checkout>("/billing/checkout-session", {
  method: "POST",
  auth: true,
  body: JSON.stringify({}),
});

      window.location.href = res.url;
    } catch (e: any) {
      setErr(e.message || "Checkout failed");
    } finally {
      setBusy(false);
    }
  }

  const status = sub?.status || "unknown";
  const tone = status === "active" || status === "trialing" ? "good" : status === "inactive" ? "warn" : "neutral";

  return (
    <RequireAuth>
      <Shell>
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-xl font-semibold">Billing</h1>
            <p className="text-sm text-zinc-400">Start a subscription (Stripe) to unlock client access.</p>
          </div>
          <Button onClick={load}>Refresh</Button>
        </div>

        {err ? <div className="mt-4 text-sm text-red-400">{err}</div> : null}

        <div className="mt-6 rounded-2xl border border-zinc-900 bg-zinc-950 p-4">
          <div className="flex items-center justify-between">
            <div className="font-medium">Subscription</div>
            <Badge tone={tone as any}>{status}</Badge>
          </div>

          <div className="mt-2 text-sm text-zinc-400">
            {sub?.current_period_end ? (
              <>Renews/ends: <span className="text-zinc-200">{new Date(sub.current_period_end).toLocaleString()}</span></>
            ) : (
              <>No period end on file.</>
            )}
          </div>

          <div className="mt-4 flex gap-2 flex-wrap">
            <Button variant="primary" disabled={busy} onClick={startCheckout}>
              {busy ? "Opening Stripe..." : "Subscribe"}
            </Button>
            <a className="text-sm text-zinc-400 underline self-center" href="/billing/success">Already paid? Click here</a>
          </div>

          <div className="mt-4 text-xs text-zinc-500">
            Backend must have STRIPE_SECRET_KEY + STRIPE_PRICE_ID set (otherwise you’ll get “Stripe not configured yet”).
          </div>
        </div>
      </Shell>
    </RequireAuth>
  );
}
