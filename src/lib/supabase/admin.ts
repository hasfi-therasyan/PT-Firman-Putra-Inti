/**
 * Service-role Supabase client — bypasses RLS.
 * Server-only. Never import in client components or expose in responses.
 */
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "Missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL"
    );
  }

  return createClient<Database>(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// Singleton — cold-start only, never leaks to client bundle.
export const supabaseAdmin = createAdminClient();
