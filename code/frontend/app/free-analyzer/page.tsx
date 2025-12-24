"use client";

import * as React from "react";
import Shell from "@/components/Shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function Page() {
  const [address, setAddress] = React.useState("");
  const [msg, setMsg] = React.useState<string | null>(null);

  return (
    <Shell>
      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="flex items-start justify-between gap-6 flex-wrap">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Free Analyzer</h1>
            <p className="text-sm text-zinc-400 mt-2">
              Quick preview mode. Premium analyzer unlocks full metrics, comps, export, and saved/share links.
            </p>
          </div>
          <Badge className="bg-zinc-900 text-zinc-200 border border-zinc-800">Free</Badge>
        </div>

        <Separator className="my-6" />

        <Card className="p-5 bg-zinc-950/40 border border-zinc-900">
          <h2 className="font-semibold">Try an address</h2>
          <p className="text-sm text-zinc-400 mt-1">This is UI-only for now (no API call).</p>

          <div className="mt-5 grid gap-3">
            <label className="grid gap-1">
              <span className="text-xs text-zinc-400">Address</span>
              <Input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="123 Main St, Fairfax, VA 22030"
              />
            </label>

            <div className="flex items-center gap-3 pt-2">
              <Button
                onClick={() => {
                  if (!address.trim()) {
                    setMsg("Enter an address first.");
                    return;
                  }
                  setMsg("Nice — next we’ll connect the backend analyzer endpoint.");
                }}
              >
                Run free check
              </Button>
              <Button variant="secondary" onClick={() => { setAddress(""); setMsg(null); }}>
                Clear
              </Button>
            </div>

            {msg && <p className="text-sm text-zinc-300">{msg}</p>}
          </div>
        </Card>
      </div>
    </Shell>
  );
}
