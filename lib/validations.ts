import { z } from 'zod';

// Relaxed validation - prioritize capturing leads over strict validation
export const leadSchema = z.object({
  from_airport_or_city: z.string().min(1).max(100),
  to_airport_or_city: z.string().min(1).max(100),
  date_time: z.string().min(1),
  pax: z.number().int().min(1).max(50),
  name: z.string().min(1).max(100),
  phone: z.string().min(1).max(50), // Relaxed from 10 chars to accept any format
  email: z.string().min(1), // Relaxed from strict email validation
  urgency: z.enum(['normal', 'urgent', 'critical']),
  notes: z.string().max(1000).optional(),
});

export type LeadFormData = z.infer<typeof leadSchema>;
