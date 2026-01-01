"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { Brand } from "@/components/Brand";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { getSession, isEmailVerified, signIn, signOut, isSupabaseConfigured } from "@/lib/supabase/auth";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const msg = searchParams.get("message");
    if (msg) setErr(msg);

    if (!isSupabaseConfigured()) {
      setErr("Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
    }
  }, [searchParams]);

  // If already authenticated via Supabase, bounce to dashboard
  useEffect(() => {
    (async () => {
      try {
        const session = await getSession();
        if (!session) return;

        if (!isEmailVerified(session.user ?? null)) {
          setErr("Please verify your email before continuing.");
          await signOut().catch(() => undefined);
          return;
        }

        router.push("/dashboard");
      } catch {
        // ignore
      }
    })();
  }, [router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    try {
      if (!isSupabaseConfigured()) {
        setErr("Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
        return;
      }

      const { session, user } = await signIn(email, password);
      const authedUser = session?.user ?? user ?? null;

      if (!isEmailVerified(authedUser)) {
        await signOut().catch(() => undefined);
        setErr("Please verify your email before signing in.");
        return;
      }

      router.push("/dashboard");
    } catch (e: any) {
      setErr(e?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-950 via-black to-neutral-950 text-amber-50">
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-16">
        <div className="mb-8 flex items-center justify-center">
          <Brand />
        </div>

        <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Don’t have an account?{" "}
          <Link href="/register" className="text-amber-300 hover:text-amber-200">
            Register
          </Link>
        </p>

        {err ? (
          <div className="mt-6 rounded-md bg-red-950/40 px-4 py-3 text-sm text-red-200">{err}</div>
        ) : null}

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Signing in..." : "Sign in"}
          </Button>

          <div className="text-center">
            <Link href="/" className="text-sm text-zinc-400 hover:text-zinc-300">
              Back to home
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
