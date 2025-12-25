import { createClient } from '@supabase/supabase-js';

// Get Supabase credentials from environment (check both prefixed and non-prefixed)
const supabaseUrl = process.env.NEXT_PUBLIC_asapflight_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
// Try service role key first (from Vercel integration), then anon key, then JWT secret as last resort
const supabaseServiceKey =
  process.env.asapflight_SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_asapflight_SUPABASE_ANON_KEY ||
  process.env.asapflight_SUPABASE_JWT_SECRET;

// Validate credentials are present
if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables. Please check NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.');
}

// Use service role key for server-side operations
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
