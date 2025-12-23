import { Lead } from '@/types/lead';
import { Resend } from 'resend';

export async function sendNotifications(lead: Lead): Promise<void> {
  const promises: Promise<void>[] = [];

  // Email notification
  if (process.env.RESEND_API_KEY && process.env.LEADS_NOTIFY_EMAIL_TO && process.env.LEADS_NOTIFY_EMAIL_FROM) {
    promises.push(sendEmailNotification(lead));
  }

  // Bland AI voice notification
  if (process.env.BLAND_API_KEY && process.env.BLAND_NOTIFY_PHONE) {
    promises.push(sendBlandNotification(lead));
  }

  // Webhook notification
  if (process.env.N8N_WEBHOOK_URL) {
    promises.push(sendWebhookNotification(lead));
  }

  await Promise.allSettled(promises);
}

async function sendEmailNotification(lead: Lead): Promise<void> {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY!);

    const urgencyLabel = lead.urgency === 'critical' ? '🚨 CRITICAL' : lead.urgency === 'urgent' ? '⚡ URGENT' : 'Normal';

    await resend.emails.send({
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
  } catch (error) {
    console.error('Email notification failed:', error);
  }
}

async function sendBlandNotification(lead: Lead): Promise<void> {
  try {
    const urgencyLabel = lead.urgency === 'critical' ? 'CRITICAL' : lead.urgency === 'urgent' ? 'URGENT' : 'Standard';

    // Create the call script for Bland
    const callScript = `
      Hi, this is an automated notification from ASAP Jet.

      You have a new ${urgencyLabel} priority charter lead.

      Passenger name: ${lead.name}

      Route: ${lead.from_airport_or_city} to ${lead.to_airport_or_city}

      Departure: ${lead.date_time}

      Number of passengers: ${lead.pax}

      Contact phone: ${lead.phone}

      Contact email: ${lead.email}

      ${lead.notes ? `Additional notes: ${lead.notes}` : ''}

      This lead was submitted at ${new Date(lead.timestamp).toLocaleString()}.

      Lead ID: ${lead.id}

      You can view full details in your admin dashboard. Thank you.
    `.trim();

    // Make Bland API call
    const response = await fetch('https://api.bland.ai/v1/calls', {
      method: 'POST',
      headers: {
        'Authorization': process.env.BLAND_API_KEY!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone_number: process.env.BLAND_NOTIFY_PHONE,
        task: callScript,
        voice: 'maya', // Professional female voice
        max_duration: 3, // 3 minutes max
        record: true,
        wait_for_greeting: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Bland API failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Bland notification sent:', data.call_id);

  } catch (error) {
    console.error('Bland notification failed:', error);
  }
}

async function sendWebhookNotification(lead: Lead): Promise<void> {
  try {
    const response = await fetch(process.env.N8N_WEBHOOK_URL!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(lead),
    });

    if (!response.ok) {
      throw new Error(`Webhook failed with status ${response.status}`);
    }
  } catch (error) {
    console.error('Webhook notification failed:', error);
  }
}
