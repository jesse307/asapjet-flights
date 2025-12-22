import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { Lead, LeadInput } from '@/types/lead';

const DATA_DIR = path.join(process.cwd(), 'data');
const LEADS_FILE = path.join(DATA_DIR, 'leads.json');

async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

async function ensureLeadsFile() {
  await ensureDataDir();
  try {
    await fs.access(LEADS_FILE);
  } catch {
    await fs.writeFile(LEADS_FILE, JSON.stringify([], null, 2));
  }
}

export async function saveRead(lead: LeadInput): Promise<Lead> {
  await ensureLeadsFile();

  const newLead: Lead = {
    id: uuidv4(),
    timestamp: new Date().toISOString(),
    ...lead,
  };

  const fileContent = await fs.readFile(LEADS_FILE, 'utf-8');
  const leads: Lead[] = JSON.parse(fileContent);
  leads.unshift(newLead); // Add to beginning for newest-first

  await fs.writeFile(LEADS_FILE, JSON.stringify(leads, null, 2));

  return newLead;
}

export async function getAllLeads(): Promise<Lead[]> {
  await ensureLeadsFile();
  const fileContent = await fs.readFile(LEADS_FILE, 'utf-8');
  return JSON.parse(fileContent);
}
