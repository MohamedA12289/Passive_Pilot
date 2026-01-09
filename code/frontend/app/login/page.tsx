"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { Brand } from "@/components/Brand";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { getSession, isEmailVerified, signIn, signOut, isSupabaseConfigured } from "@/lib/supabase/auth";
import { apiFetch } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Supabase/Whoop login
  const [email, setEmail] = useState("");
  const [supabasePassword, setSupabasePassword] = useState("");

  // Username/password login
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginMode, setLoginMode] = useState<"whoop" | "password">("whoop");

  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const msg = searchParams.get("message");
    if (msg) setErr(msg);
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

  // Whoop/Supabase login handler
  async function onWhoopSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    try {
      if (!isSupabaseConfigured()) {
        setErr("Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
        return;
      }

      const { session, user } = await signIn(email, supabasePassword);
      const authedUser = session?.user ?? user ?? null;

      if (!isEmailVerified(authedUser)) {
        await signOut().catch(() => undefined);
        setErr("Please verify your email before signing in.");
        return;
      }

      router.push("/dashboard");
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Login failed";
      setErr(message);
    } finally {
      setLoading(false);
    }
  }

  // Username/password login handler
  async function onPasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    try {
      const res = await apiFetch<{
        access_token: string;
        user_id: number;
        email: string;
        role: string;
      }>("/auth/login-password", {
        method: "POST",
        json: { username, password },
      });

      // Store token
      localStorage.setItem("access_token", res.access_token);
      localStorage.setItem("token", res.access_token);

      router.push("/dashboard");
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Login failed";
      setErr(message.includes("401") ? "Invalid username or password" : message);
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
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-amber-300 hover:text-amber-200">
            Register
          </Link>
        </p>

        {err ? (
          <div className="mt-6 rounded-md bg-red-950/40 px-4 py-3 text-sm text-red-200">{err}</div>
        ) : null}

        {/* Whoop OAuth / Supabase Login */}
        <div className="mt-6">
          <Button
            type="button"
            onClick={() => setLoginMode("whoop")}
            className={`w-full ${loginMode === "whoop" ? "bg-amber-600" : "bg-zinc-700"}`}
          >
            Continue with Whoop
          </Button>
        </div>

        {loginMode === "whoop" && isSupabaseConfigured() && (
          <form onSubmit={onWhoopSubmit} className="mt-4 space-y-4">
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
              value={supabasePassword}
              onChange={(e) => setSupabasePassword(e.target.value)}
              placeholder="••••••••"
              required
            />
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Signing in..." : "Sign in with Whoop"}
            </Button>
          </form>
        )}

        {/* Divider */}
        <div className="mt-6 flex items-center">
          <div className="flex-grow border-t border-zinc-700" />
          <span className="px-4 text-sm text-zinc-500">or</span>
          <div className="flex-grow border-t border-zinc-700" />
        </div>

        {/* Username/Password Login */}
        <form onSubmit={onPasswordSubmit} className="mt-6 space-y-4">
          <Input
            label="Username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="your_username"
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
          <Button type="submit" disabled={loading} className="w-full bg-zinc-700 hover:bg-zinc-600">
            {loading ? "Logging in..." : "Log in"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-zinc-400 hover:text-zinc-300">
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
