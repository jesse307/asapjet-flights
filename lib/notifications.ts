import { Lead } from '@/types/lead';
import { Resend } from 'resend';

export async function sendNotifications(lead: Lead): Promise<void> {
  const promises: Promise<void>[] = [];

  console.log('[Notifications] Starting notifications for lead:', lead.id);

  // Email notification
  if (process.env.RESEND_API_KEY && process.env.LEADS_NOTIFY_EMAIL_TO && process.env.LEADS_NOTIFY_EMAIL_FROM) {
    console.log('[Notifications] Email notification enabled');
    promises.push(sendEmailNotification(lead));
  } else {
    console.warn('[Notifications] Email notification skipped - missing env vars:', {
      hasResendKey: !!process.env.RESEND_API_KEY,
      hasEmailTo: !!process.env.LEADS_NOTIFY_EMAIL_TO,
      hasEmailFrom: !!process.env.LEADS_NOTIFY_EMAIL_FROM
    });
  }

  // VAPI voice notification
  if (process.env.VAPI_API_KEY && process.env.VAPI_PHONE_NUMBER_ID && process.env.VAPI_NOTIFY_PHONE) {
    console.log('[Notifications] VAPI voice notification enabled');
    promises.push(sendVapiNotification(lead));
  } else {
    console.warn('[Notifications] VAPI voice notification skipped - missing env vars:', {
      hasVapiKey: !!process.env.VAPI_API_KEY,
      hasPhoneNumberId: !!process.env.VAPI_PHONE_NUMBER_ID,
      hasNotifyPhone: !!process.env.VAPI_NOTIFY_PHONE
    });
  }

  // Webhook notification
  if (process.env.N8N_WEBHOOK_URL) {
    console.log('[Notifications] Webhook notification enabled');
    promises.push(sendWebhookNotification(lead));
  } else {
    console.warn('[Notifications] Webhook notification skipped - N8N_WEBHOOK_URL not set');
  }

  const results = await Promise.allSettled(promises);

  results.forEach((result, index) => {
    if (result.status === 'rejected') {
      console.error(`[Notifications] Promise ${index} failed:`, result.reason);
    }
  });

  console.log('[Notifications] All notifications processed');
}

async function sendEmailNotification(lead: Lead): Promise<void> {
  try {
    console.log('[Email] Initializing Resend with key:', process.env.RESEND_API_KEY?.substring(0, 10) + '...');
    const resend = new Resend(process.env.RESEND_API_KEY!);

    const urgencyLabel = lead.urgency === 'critical' ? '🚨 CRITICAL' : lead.urgency === 'urgent' ? '⚡ URGENT' : 'Normal';

    console.log('[Email] Sending email from:', process.env.LEADS_NOTIFY_EMAIL_FROM, 'to:', process.env.LEADS_NOTIFY_EMAIL_TO);

    const result = await resend.emails.send({
      from: process.env.LEADS_NOTIFY_EMAIL_FROM!,
      to: process.env.LEADS_NOTIFY_EMAIL_TO!,
      subject: `New ASAP Jet Lead - ${urgencyLabel} - ${lead.name}`,
      text: `
New Charter Lead Received
========================

Urgency: ${urgencyLabel}
Time: ${new Date(lead.timestamp).toLocaleString()}

PASSENGER INFO
--------------
Name: ${lead.name}
Email: ${lead.email}
Phone: ${lead.phone}
Passengers: ${lead.pax}

FLIGHT INFO
-----------
From: ${lead.from_airport_or_city}
To: ${lead.to_airport_or_city}
Date/Time: ${lead.date_time}

NOTES
-----
${lead.notes || 'None'}

---
Lead ID: ${lead.id}
      `.trim(),
    });

    console.log('[Email] Email sent successfully:', result.data?.id || 'success');
  } catch (error) {
    console.error('[Email] Email notification failed:', error);
    throw error; // Re-throw so Promise.allSettled catches it
  }
}

async function sendVapiNotification(lead: Lead): Promise<void> {
  try {
    const urgencyLabel = lead.urgency === 'critical' ? 'CRITICAL' : lead.urgency === 'urgent' ? 'URGENT' : 'standard';

    console.log('[VAPI] Initiating call to:', process.env.VAPI_NOTIFY_PHONE);

    // Create the assistant message for VAPI
    const assistantMessage = `Hi, this is an automated notification from ASAP Jet. You have a new ${urgencyLabel} priority charter lead. Passenger name: ${lead.name}. Route: ${lead.from_airport_or_city} to ${lead.to_airport_or_city}. Departure: ${lead.date_time}. Number of passengers: ${lead.pax}. Contact phone: ${lead.phone}. Contact email: ${lead.email}. ${lead.notes ? `Additional notes: ${lead.notes}.` : ''} This lead was submitted at ${new Date(lead.timestamp).toLocaleString()}. Lead ID: ${lead.id}. You can view full details in your admin dashboard. Thank you.`;

    // Make VAPI API call to initiate phone call
    const response = await fetch('https://api.vapi.ai/call/phone', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.VAPI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phoneNumberId: process.env.VAPI_PHONE_NUMBER_ID,
        customer: {
          number: process.env.VAPI_NOTIFY_PHONE,
        },
        assistant: {
          firstMessage: assistantMessage,
          model: {
            provider: 'openai',
            model: 'gpt-3.5-turbo',
            messages: [
              {
                role: 'system',
                content: 'You are a professional notification assistant for ASAP Jet. Deliver the notification message clearly and professionally. After delivering the message, confirm the listener understood and end the call politely.'
              }
            ]
          },
          voice: {
            provider: '11labs',
            voiceId: 'rachel'
          }
        },
        metadata: {
          leadId: lead.id,
          urgency: lead.urgency,
          passengerName: lead.name
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`VAPI API failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('[VAPI] Call initiated successfully. Call ID:', data.id);

    // Log the call to Supabase
    if (data.id) {
      await logCall(lead.id, data.id, 'initiated');
    }

  } catch (error) {
    console.error('[VAPI] Voice notification failed:', error);
    throw error; // Re-throw so Promise.allSettled catches it
  }
}

async function logCall(leadId: string, callId: string, status: string): Promise<void> {
  try {
    // Import dynamically to avoid circular dependency
    const { createClient } = await import('@supabase/supabase-js');

    const supabaseUrl = process.env.NEXT_PUBLIC_asapflights_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey =
      process.env.NEXT_PUBLIC_asapflights_SUPABASE_ANON_KEY ||
      process.env.asapflights_SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.asapflights_SUPABASE_JWT_SECRET;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.warn('[VAPI] Skipping call logging - Supabase not configured');
      return;
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { error } = await supabase
      .from('call_logs')
      .insert([
        {
          lead_id: leadId,
          call_id: callId,
          status: status,
          timestamp: new Date().toISOString(),
        }
      ]);

    if (error) {
      console.error('[VAPI] Failed to log call:', error);
    } else {
      console.log('[VAPI] Call logged to database');
    }
  } catch (error) {
    console.error('[VAPI] Error logging call:', error);
  }
}

async function sendWebhookNotification(lead: Lead): Promise<void> {
  try {
    console.log('[Webhook] Sending to:', process.env.N8N_WEBHOOK_URL);
    const response = await fetch(process.env.N8N_WEBHOOK_URL!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(lead),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Webhook failed with status ${response.status}: ${errorText}`);
    }

    console.log('[Webhook] Webhook sent successfully');
  } catch (error) {
    console.error('[Webhook] Webhook notification failed:', error);
    throw error; // Re-throw so Promise.allSettled catches it
  }
}
