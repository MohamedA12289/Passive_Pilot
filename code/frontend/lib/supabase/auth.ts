import type { AuthChangeEvent, Session, User } from "@supabase/supabase-js";
import { supabase } from "./client";

function requireSupabase() {
  if (!supabase) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }
  return supabase;
}

function isUserVerified(user: User | null): boolean {
  if (!user) return false;
  return Boolean(
    (user as any).email_confirmed_at ||
      (user as any).confirmed_at ||
      (user as any).identities?.some((i: any) => i?.identity_data?.email_verified)
  );
}

export async function signUp(email: string, password: string, role: string = "wholesaler") {
  const sb = requireSupabase();
  const { error } = await sb.auth.signUp({ email, password });
  if (error) throw new Error(error.message || "Sign up failed");
  // Store selected role for later use during backend registration
  if (typeof window !== "undefined") {
    localStorage.setItem("signup_role", role);
  }
}

export async function signIn(email: string, password: string) {
  const sb = requireSupabase();
  const { data, error } = await sb.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message || "Login failed");
  return data;
}

export async function signOut() {
  if (!supabase) return; // if not configured, no-op
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message || "Logout failed");
}

export async function getSession() {
  if (!supabase) return null; // important: build/CI-safe
  const { data, error } = await supabase.auth.getSession();
  if (error) throw new Error(error.message || "Failed to get session");
  return data.session;
}

export function onAuthStateChange(handler: (event: AuthChangeEvent, session: Session | null) => void) {
  if (!supabase) return () => {}; // safe no-op unsubscribe
  const { data } = supabase.auth.onAuthStateChange(handler);
  return data.subscription.unsubscribe;
}

export function isEmailVerified(user: User | null): boolean {
  return isUserVerified(user);
}

export function isSupabaseConfigured(): boolean {
  return Boolean(supabase);
}
