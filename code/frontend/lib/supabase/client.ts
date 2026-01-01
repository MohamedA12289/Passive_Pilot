import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// IMPORTANT:
// Do NOT throw at module import time. Next.js prerenders pages during build,
// and CI will not have these env vars. Instead, export null and handle it in UI.
export const supabase: SupabaseClient | null =
  supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

export function assertSupabaseConfigured(): asserts supabase is SupabaseClient {
  if (!supabaseUrl) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL. Add it to your environment variables.");
  }
  if (!supabaseAnonKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY. Add it to your environment variables.");
  }
}
