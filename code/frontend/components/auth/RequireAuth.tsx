"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getSession,
  isEmailVerified,
  onAuthStateChange,
  signOut,
  isSupabaseConfigured,
} from "@/lib/supabase/auth";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ok, setOk] = useState(false);

  useEffect(() => {
    let unsub: (() => void) | undefined;

    function redirect(message: string) {
      const params = new URLSearchParams();
      params.set("message", message);
      router.replace(`/login?${params.toString()}`);
    }

    if (!isSupabaseConfigured()) {
      redirect("Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
      return;
    }

    async function validateSession() {
      try {
        const session = await getSession();
        if (!session) {
          redirect("Please sign in to continue.");
          return;
        }
        if (!isEmailVerified(session.user ?? null)) {
          await signOut().catch(() => undefined);
          redirect("Verify your email to continue.");
          return;
        }
        setOk(true);
      } catch (err) {
        console.error(err);
        redirect("Please sign in to continue.");
      }
    }

    validateSession();

    // eslint-disable-next-line prefer-const
    unsub = onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        redirect("Please sign in to continue.");
        return;
      }
      if (!isEmailVerified(session.user ?? null)) {
        redirect("Verify your email to continue.");
        return;
      }
      setOk(true);
    });

    return () => {
      if (unsub) unsub();
    };
  }, [router]);

  if (!ok) return null;
  return <>{children}</>;
}
