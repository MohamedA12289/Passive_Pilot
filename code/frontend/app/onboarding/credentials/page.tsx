"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Brand } from "@/components/Brand";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { apiFetch, getAccessToken } from "@/lib/api";

interface UserMe {
  id: number;
  email: string;
  role: string;
  username: string | null;
  needs_credentials: boolean;
}

export default function CredentialsPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Check if user is authenticated and needs credentials
  useEffect(() => {
    (async () => {
      try {
        const token = getAccessToken();
        if (!token) {
          router.push("/login");
          return;
        }

        const user = await apiFetch<UserMe>("/auth/me", { auth: true });

        if (!user.needs_credentials) {
          // User already has credentials, redirect to dashboard
          router.push("/dashboard");
          return;
        }

        setCheckingAuth(false);
      } catch {
        router.push("/login");
      }
    })();
  }, [router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);

    // Validation
    if (username.length < 3 || username.length > 30) {
      setErr("Username must be 3-30 characters");
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setErr("Username can only contain letters, numbers, and underscores");
      return;
    }

    if (password.length < 8) {
      setErr("Password must be at least 8 characters");
      return;
    }

    if (password !== confirmPassword) {
      setErr("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      await apiFetch("/auth/set-credentials", {
        method: "POST",
        auth: true,
        json: { username, password },
      });

      router.push("/dashboard");
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Failed to set credentials";
      if (message.includes("400")) {
        setErr("Username already taken");
      } else {
        setErr(message);
      }
    } finally {
      setLoading(false);
    }
  }

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-neutral-950 via-black to-neutral-950 text-amber-50 flex items-center justify-center">
        <p className="text-zinc-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-950 via-black to-neutral-950 text-amber-50">
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-16">
        <div className="mb-8 flex items-center justify-center">
          <Brand />
        </div>

        <h1 className="text-2xl font-semibold tracking-tight">Set Up Your Credentials</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Create a username and password to log in directly next time.
        </p>

        {err ? (
          <div className="mt-6 rounded-md bg-red-950/40 px-4 py-3 text-sm text-red-200">{err}</div>
        ) : null}

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <Input
            label="Username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="your_username"
            required
          />
          <p className="text-xs text-zinc-500 -mt-2">3-30 characters, letters, numbers, underscores only</p>

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
          <p className="text-xs text-zinc-500 -mt-2">At least 8 characters</p>

          <Input
            label="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            required
          />

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Setting up..." : "Complete Setup"}
          </Button>
        </form>
      </div>
    </div>
  );
}
