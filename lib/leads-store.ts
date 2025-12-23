import { createClient } from '@supabase/supabase-js';
import { Lead, LeadInput } from '@/types/lead';

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
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function saveLead(lead: LeadInput): Promise<Lead> {
  const { data, error } = await supabase
    .from('leads')
    .insert([
      {
        ...lead,
        timestamp: new Date().toISOString(),
      }
    ])
    .select()
    .single();

  if (error) {
    console.error('Error saving lead to Supabase:', error);
    throw new Error('Failed to save lead');
  }

  return data as Lead;
}

export async function getAllLeads(): Promise<Lead[]> {
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .order('timestamp', { ascending: false });

  if (error) {
    console.error('Error fetching leads from Supabase:', error);
    return [];
  }

  return (data as Lead[]) || [];
}
