import { createClient } from "@supabase/supabase-js";

/**
 * Supabase client dengan hak akses service_role (Admin).
 * HANYA digunakan di sisi server (Server Actions, Route Handlers, Background jobs).
 * Bypass Row Level Security (RLS).
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL atau SUPABASE_SERVICE_ROLE_KEY belum diisi di .env.local"
    );
  }

  return createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

