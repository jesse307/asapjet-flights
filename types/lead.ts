export type Urgency = 'normal' | 'urgent' | 'critical';

export type Lead = {
  id: string;
  timestamp: string;
  from_airport_or_city: string;
  to_airport_or_city: string;
  date_time: string;
  pax: number;
  name: string;
  phone: string;
  email: string;
  urgency: Urgency;
  notes?: string;
};

export type LeadInput = Omit<Lead, 'id' | 'timestamp'>;
