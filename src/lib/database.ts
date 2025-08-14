import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { createClient } from "@supabase/supabase-js";
import * as schema from "./schema";

// Neon Database Connection (only if URL is provided)
let db: any = null;
if (process.env.NEON_DATABASE_URL) {
  const sql = neon(process.env.NEON_DATABASE_URL);
  db = drizzle(sql, { schema });
}

export { db };

// Supabase Client (optional - only if configured)
export const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  : null;

// Admin Supabase Client (for server-side operations)
export const supabaseAdmin = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )
  : null;
