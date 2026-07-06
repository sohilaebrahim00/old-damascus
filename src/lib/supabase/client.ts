import { createBrowserClient } from "@supabase/ssr";

export function isSupabaseConfigured(): boolean {
  return (
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    (!!process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  );
}

export function createClient() {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured. Missing required environment variables.");
  }
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  return createBrowserClient(supabaseUrl, supabaseKey);
}
