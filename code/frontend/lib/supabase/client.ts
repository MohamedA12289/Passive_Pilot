import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// IMPORTANT:
// Do NOT throw at module import time. Next.js prerenders pages during build,
// and CI will not have these env vars. Instead, export null and handle it in UI.
export const supabase: SupabaseClient | null =
  supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

export function isSupabaseConfigured(): boolean {
  return Boolean(supabase);
}

/**
 * Use this inside event handlers / client-only flows when you need a real client.
 * Example:
 *   const sb = requireSupabase();
 *   await sb.auth.signInWithPassword(...)
 */
export function requireSupabase(): SupabaseClient {
  if (!supabaseUrl) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL. Add it to your environment variables.");
  }
  if (!supabaseAnonKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY. Add it to your environment variables.");
  }
  // At this point, supabase must be non-null
  return createClient(supabaseUrl, supabaseAnonKey);
}
