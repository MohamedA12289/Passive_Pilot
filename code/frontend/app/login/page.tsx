"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Brand } from "@/components/Brand";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { getToken, setToken } from "@/lib/storage";
import { API_BASE } from "@/lib/api";

type Token = { access_token: string; token_type: string };

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const t = getToken();
    if (t) router.push("/dashboard");
  }, [router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ username: email, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.detail || `HTTP ${res.status}`);
      }
      const data = (await res.json()) as Token;
      setToken(data.access_token);
      router.push("/dashboard");
    } catch (e: any) {
      setErr(e.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-zinc-900 bg-zinc-950 p-6">
        <div className="mb-6"><Brand /></div>
        <h1 className="text-xl font-semibold mb-1">Sign in</h1>
        <p className="text-sm text-zinc-400 mb-6">Use your account to access your campaigns.</p>
        {err ? <div className="mb-4 text-sm text-red-400">{err}</div> : null}
        <form onSubmit={onSubmit} className="space-y-4">
          <Input label="Email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" />
          <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          <Button variant="primary" disabled={loading} className="w-full">{loading ? "Signing in..." : "Sign in"}</Button>
        </form>
        <div className="mt-5 text-sm text-zinc-400">No account? <Link className="text-white underline" href="/register">Create one</Link></div>
      </div>
    </div>
  );
}
