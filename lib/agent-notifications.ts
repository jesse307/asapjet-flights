import { Resend } from 'resend';
import type { Agent } from '@/types/agent';

export async function sendOnCallNotification(agent: Agent): Promise<void> {
  // Only send if Resend is configured
  if (!process.env.RESEND_API_KEY || !process.env.LEADS_NOTIFY_EMAIL_FROM) {
    console.warn('[Agent Notification] Skipping - Resend not configured');
    return;
  }

  try {
    console.log('[Agent Notification] Sending on-call notification to:', agent.email);
    const resend = new Resend(process.env.RESEND_API_KEY);

    await resend.emails.send({
      from: process.env.LEADS_NOTIFY_EMAIL_FROM,
      to: agent.email,
      subject: '🚨 You are now ON CALL for ASAP Jet Leads',
      text: `
Hi ${agent.name},

You have been placed ON CALL for ASAP Jet charter lead notifications.

What this means:
- You will receive email notifications for all new charter leads
- You will receive phone call notifications for urgent and critical leads
- All leads will be forwarded to: ${agent.email}
- Phone notifications will be sent to: ${agent.phone}

Please ensure:
✓ Your phone is on and ringer is enabled
✓ You're monitoring ${agent.email} for lead emails
✓ You're ready to respond to charter inquiries promptly

You can view all leads in the admin dashboard at:
https://asapjet-flights.vercel.app/admin/leads

If you have any questions or need to be taken off call, please contact your administrator.

Thank you,
ASAP Jet System
      `.trim(),
    });

    console.log('[Agent Notification] On-call notification sent successfully');
  } catch (error) {
    console.error('[Agent Notification] Failed to send on-call notification:', error);
    // Don't throw - notification failure shouldn't break the agent update
  }
}
