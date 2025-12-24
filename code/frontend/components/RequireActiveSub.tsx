"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

type Sub = { status: string };

const ALLOW = new Set<string>(["/billing", "/billing/success", "/billing/cancel", "/providers", "/settings", "/process", "/templates", "/ai"]);

function isActive(status: string) {
  return status === "active" || status === "trialing";
}

export function RequireActiveSub({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ok, setOk] = useState(false);

  useEffect(() => {
    if (ALLOW.has(pathname)) {
      setOk(true);
      return;
    }

    async function check() {
      try {
        const sub = await apiFetch<Sub>("/billing/me", { auth: true });
        if (!isActive(sub.status)) {
          router.push("/billing");
          return;
        }
        setOk(true);
      } catch {
        // If billing endpoints not ready yet, don't block app
        setOk(true);
      }
    }

    check();
  }, [pathname, router]);

  if (!ok) return null;
  return <>{children}</>;
}
