import { createClient } from '@supabase/supabase-js';
import { Lead, LeadInput } from '@/types/lead';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

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
