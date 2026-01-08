"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Brand } from "@/components/Brand";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { getSession, isEmailVerified, signUp, isSupabaseConfigured } from "@/lib/supabase/auth";

function getPasswordError(pw: string): string | null {
  if (/\s/.test(pw)) return "Password must have no white space";
  if (pw.length > 72) return "Password must be maximum 72 characters";
  if (pw.length > 0 && pw.length < 6) return "Password must be minimum 6 characters";
  return null;
}

export default function RegisterPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"buyer" | "wholesaler">("wholesaler");

  const [err, setErr] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // If already logged in, bounce
  useEffect(() => {
    (async () => {
      try {
        const session = await getSession();
        if (session && isEmailVerified(session.user ?? null)) router.push("/dashboard");
      } catch {
        // ignore
      }
    })();
  }, [router]);

  // If Supabase isn't configured, show a clear message
  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setErr("Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
    }
  }, []);

  const passwordError = useMemo(() => getPasswordError(password), [password]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setMessage(null);

    if (!isSupabaseConfigured()) {
      setErr("Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
      return;
    }

    const pwErr = getPasswordError(password);
    if (pwErr) {
      setErr(pwErr);
      return;
    }

    setLoading(true);
    try {
      await signUp(email, password, role);
      setPassword("");
      setMessage("Check your email to verify your account, then log in.");
    } catch (e: unknown) {
      const errMsg = e instanceof Error ? e.message : "Registration failed";
      setErr(errMsg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-zinc-950/60 backdrop-blur p-6">
        <div className="mb-6">
          <Brand />
        </div>

        <h1 className="text-xl font-semibold mb-1">Create account</h1>
        <p className="text-sm text-zinc-400 mb-6">Register, then log in.</p>

        {err ? <div className="mb-4 text-sm text-red-400">{err}</div> : null}
        {message ? <div className="mb-4 text-sm text-emerald-400">{message}</div> : null}

        <form onSubmit={onSubmit} className="space-y-4">
          <Input
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            required
          />

          <div>
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password"
              required
            />
            {passwordError ? <div className="mt-1 text-xs text-red-400">{passwordError}</div> : null}
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">I am a</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as "buyer" | "wholesaler")}
              className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
            >
              <option value="wholesaler">Wholesaler</option>
              <option value="buyer">Buyer</option>
            </select>
          </div>

          <Button variant="primary" disabled={loading} className="w-full" type="submit">
            {loading ? "Creating..." : "Create account"}
          </Button>
        </form>

        {message ? (
          <div className="mt-4">
            <Button className="w-full" onClick={() => router.push("/login")}>
              Go to login
            </Button>
          </div>
        ) : null}

        <div className="mt-5 text-sm text-zinc-400">
          Already have an account?{" "}
          <Link className="text-white underline" href="/login">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
