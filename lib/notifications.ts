import { Lead } from '@/types/lead';
import { Resend } from 'resend';
import { Twilio } from 'twilio';

export async function sendNotifications(lead: Lead): Promise<void> {
  const promises: Promise<void>[] = [];

  // Email notification
  if (process.env.RESEND_API_KEY && process.env.LEADS_NOTIFY_EMAIL_TO && process.env.LEADS_NOTIFY_EMAIL_FROM) {
    promises.push(sendEmailNotification(lead));
  }

  // SMS notification
  if (
    process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_AUTH_TOKEN &&
    process.env.TWILIO_FROM_NUMBER &&
    process.env.TWILIO_TO_NUMBER
  ) {
    promises.push(sendSMSNotification(lead));
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

async function sendSMSNotification(lead: Lead): Promise<void> {
  try {
    const client = new Twilio(
      process.env.TWILIO_ACCOUNT_SID!,
      process.env.TWILIO_AUTH_TOKEN!
    );

    const urgencyEmoji = lead.urgency === 'critical' ? '🚨' : lead.urgency === 'urgent' ? '⚡' : '✈️';

    await client.messages.create({
      from: process.env.TWILIO_FROM_NUMBER!,
      to: process.env.TWILIO_TO_NUMBER!,
      body: `${urgencyEmoji} ASAP Jet Lead\n${lead.name} | ${lead.pax} pax\n${lead.from_airport_or_city} → ${lead.to_airport_or_city}\n${lead.date_time}\n${lead.phone}`,
    });
  } catch (error) {
    console.error('SMS notification failed:', error);
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
