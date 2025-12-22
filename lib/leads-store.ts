import { kv } from '@vercel/kv';
import { v4 as uuidv4 } from 'uuid';
import { Lead, LeadInput } from '@/types/lead';

const LEADS_KEY = 'leads';

export async function saveLead(lead: LeadInput): Promise<Lead> {
  const newLead: Lead = {
    id: uuidv4(),
    timestamp: new Date().toISOString(),
    ...lead,
  };

  // Get existing leads
  const leads = await getAllLeads();

  // Add new lead to beginning (newest first)
  leads.unshift(newLead);

  // Save back to KV
  await kv.set(LEADS_KEY, JSON.stringify(leads));

  return newLead;
}

export async function getAllLeads(): Promise<Lead[]> {
  const leadsData = await kv.get<string>(LEADS_KEY);

  if (!leadsData) {
    return [];
  }

  try {
    return JSON.parse(leadsData);
  } catch {
    return [];
  }
}
