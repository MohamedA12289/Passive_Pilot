"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function makeId() {
  return Math.random().toString(36).slice(2, 10);
}

export default function NewCampaignPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  async function onCreate() {
    setLoading(true);
    try {
      // Placeholder: later call backend to create campaign
      const id = makeId();
      router.push(`/campaigns/${id}/flow/1-create?name=${encodeURIComponent(name || "New Campaign")}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-80px)]">
      <div className="mx-auto max-w-4xl px-4 py-12">
        <div className="rounded-3xl border border-white/10 bg-black/40 backdrop-blur p-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-yellow-400/30 bg-yellow-400/10 px-3 py-1 text-xs text-yellow-200">
            Start a new campaign
          </div>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white">
            Build your list step-by-step
          </h1>
          <p className="mt-3 text-white/70 max-w-2xl">
            We’ll walk you through area selection, filters, lead source, preview, scoring, and export.
          </p>

          <div className="mt-8 grid gap-3 max-w-md">
            <label className="text-sm text-white/80">Campaign name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Richmond VA • Vacant + Absentee"
            />
            <Button onClick={onCreate} disabled={loading}>
              {loading ? "Creating..." : "Start Campaign Flow"}
            </Button>
            <p className="text-xs text-white/50">
              (Backend create endpoint will be wired later — this is a UI-first flow.)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
