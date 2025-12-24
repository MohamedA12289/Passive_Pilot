"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/api";
import { loadSettings } from "@/lib/storage";

export type Me = { id: number; email: string };
export type Sub = { status: string; current_period_end?: string | null };

export function useMe() {
  const [me, setMe] = useState<Me | null>(null);
  const [sub, setSub] = useState<Sub | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    setError(null);
    setLoading(true);
    try {
      const m = await apiFetch<Me>("/auth/me", { auth: true });
      setMe(m);
      // billing may not exist yet on backend; tolerate errors
      try {
        const s = await apiFetch<Sub>("/billing/me", { auth: true });
        setSub(s);
      } catch {
        setSub({ status: "unknown" });
      }
    } catch (e: any) {
      setError(e?.message || "Failed to load profile");
      setMe(null);
      setSub(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { refresh(); }, []);

  const settings = useMemo(() => loadSettings(), []);

  return { me, sub, loading, error, refresh, settings };
}
