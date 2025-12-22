import { z } from 'zod';

export const leadSchema = z.object({
  from_airport_or_city: z.string().min(2, 'Departure location is required').max(100),
  to_airport_or_city: z.string().min(2, 'Destination is required').max(100),
  date_time: z.string().min(1, 'Travel date and time is required'),
  pax: z.number().int().min(1, 'At least 1 passenger required').max(50, 'Maximum 50 passengers'),
  name: z.string().min(2, 'Name is required').max(100),
  phone: z.string().min(10, 'Valid phone number required').max(20),
  email: z.string().email('Valid email required'),
  urgency: z.enum(['normal', 'urgent', 'critical']),
  notes: z.string().max(1000).optional(),
});

export type LeadFormData = z.infer<typeof leadSchema>;
