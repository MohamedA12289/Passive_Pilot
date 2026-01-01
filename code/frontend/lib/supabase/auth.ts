import type { AuthChangeEvent, Session, User } from "@supabase/supabase-js";
import { supabase } from "./client";

function isUserVerified(user: User | null): boolean {
  if (!user) return false;
  return Boolean(
    user.email_confirmed_at ||
      (user as any).confirmed_at ||
      user.identities?.some((i) => (i.identity_data as any)?.email_verified)
  );
}

export async function signUp(email: string, password: string) {
  const { error } = await supabase.auth.signUp({ email, password });
  if (error) throw new Error(error.message || "Sign up failed");
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message || "Login failed");
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message || "Logout failed");
}

export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw new Error(error.message || "Failed to get session");
  return data.session;
}

export function onAuthStateChange(handler: (event: AuthChangeEvent, session: Session | null) => void) {
  const { data } = supabase.auth.onAuthStateChange(handler);
  return data.subscription.unsubscribe;
}

export function isEmailVerified(user: User | null): boolean {
  return isUserVerified(user);
}
