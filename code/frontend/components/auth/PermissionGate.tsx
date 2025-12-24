"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Props = {
  /**
   * If true, user must be logged in (token present) to view content.
   * We keep this lightweight: it just checks localStorage for an access token.
   */
  requireAuth?: boolean;
  /** Optional roles list if you later store roles in localStorage ("pp_roles"). */
  rolesAnyOf?: string[];
  children: React.ReactNode;
};

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token") || localStorage.getItem("token");
}

function getRoles(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("pp_roles") || "[]";
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

export default function PermissionGate({ requireAuth = false, rolesAnyOf, children }: Props) {
  const [ready, setReady] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [roles, setRoles] = useState<string[]>([]);

  useEffect(() => {
    setToken(getToken());
    setRoles(getRoles());
    setReady(true);
  }, []);

  const roleOk = useMemo(() => {
    if (!rolesAnyOf || rolesAnyOf.length === 0) return true;
    return rolesAnyOf.some((r) => roles.includes(r));
  }, [rolesAnyOf, roles]);

  if (!ready) {
    return (
      <div className="rounded-2xl border border-neutral-800 bg-neutral-950/60 p-6 text-sm text-neutral-400">
        Checking access…
      </div>
    );
  }

  if (requireAuth && !token) {
    return (
      <div className="rounded-2xl border border-neutral-800 bg-neutral-950/60 p-6">
        <h3 className="text-lg font-semibold text-neutral-100">Login required</h3>
        <p className="mt-2 text-sm text-neutral-400">
          You need to be logged in to use this feature.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/auth/login"
            className="rounded-xl bg-yellow-500 px-4 py-2 text-sm font-semibold text-black hover:bg-yellow-400"
          >
            Go to Login
          </Link>
          <Link
            href="/"
            className="rounded-xl border border-neutral-800 bg-neutral-900/50 px-4 py-2 text-sm font-semibold text-neutral-100 hover:bg-neutral-900"
          >
            Back home
          </Link>
        </div>
      </div>
    );
  }

  if (!roleOk) {
    return (
      <div className="rounded-2xl border border-neutral-800 bg-neutral-950/60 p-6">
        <h3 className="text-lg font-semibold text-neutral-100">Not enough permission</h3>
        <p className="mt-2 text-sm text-neutral-400">
          Your account doesn’t have access to this section.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
