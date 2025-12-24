"use client";
import { RequireAuth } from "@/components/RequireAuth";
import { RequireActiveSub } from "@/components/RequireActiveSub";

export function Authed({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth>
      <RequireActiveSub>{children}</RequireActiveSub>
    </RequireAuth>
  );
}
