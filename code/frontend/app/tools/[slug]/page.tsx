"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { toolsBySlug } from "@/lib/toolsCatalog";

function NumberField({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
}) {
  return (
    <label className="block">
      <div className="text-sm text-zinc-200">{label}</div>
      {hint ? <div className="text-xs text-zinc-400 mt-0.5">{hint}</div> : null}
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        inputMode="decimal"
        className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950/60 px-3 py-2 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/30"
        placeholder="0"
      />
    </label>
  );
}

export default function ToolPage({ params }: { params: { slug: string } }) {
  const tool = toolsBySlug[params.slug];

  // Simple universal calculator template (we’ll expand later per-tool)
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const result = useMemo(() => {
    const na = Number(a);
    const nb = Number(b);
    if (Number.isFinite(na) && Number.isFinite(nb)) return (na + nb).toFixed(2);
    return "—";
  }, [a, b]);

  if (!tool) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-6">
          <div className="text-white text-xl font-semibold">Tool not found</div>
          <p className="text-zinc-300 mt-2">That tool slug doesn’t exist.</p>
          <Link className="inline-block mt-6 text-yellow-300 hover:text-yellow-200" href="/tools">
            ← Back to Tools
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-sm text-zinc-400">
            <Link className="hover:text-yellow-200" href="/tools">
              Tools
            </Link>{" "}
            <span className="mx-2">/</span> <span className="text-zinc-300">{tool.title}</span>
          </div>
          <h1 className="mt-2 text-3xl font-semibold text-white">{tool.title}</h1>
          <p className="mt-2 text-zinc-300">{tool.description}</p>
        </div>
        <span className="hidden md:inline-flex text-xs px-3 py-1 rounded-full border border-zinc-800 bg-zinc-950/60 text-zinc-200">
          UI wired — API later
        </span>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-6">
          <div className="text-white font-semibold">Calculator (placeholder)</div>
          <p className="text-sm text-zinc-400 mt-1">
            We’ll replace this with the real {tool.title} logic next.
          </p>

          <div className="mt-6 space-y-4">
            <NumberField label="Input A" value={a} onChange={setA} />
            <NumberField label="Input B" value={b} onChange={setB} />
          </div>

          <div className="mt-6 rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4">
            <div className="text-xs uppercase tracking-wide text-yellow-200">Result</div>
            <div className="mt-1 text-2xl font-semibold text-white">{result}</div>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-6">
          <div className="text-white font-semibold">How to use</div>
          <ul className="mt-3 space-y-2 text-sm text-zinc-300 list-disc pl-5">
            {tool.howTo.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>

          <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900/30 p-4">
            <div className="text-xs uppercase tracking-wide text-zinc-300">Notes</div>
            <p className="mt-2 text-sm text-zinc-300">
              This is the UI shell in the old Passive Pilot style. Next zip(s) will wire each tool
              to real calculations + backend exports where needed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
