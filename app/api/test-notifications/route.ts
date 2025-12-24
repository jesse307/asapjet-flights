import { NextResponse } from 'next/server';
import { sendNotifications } from '@/lib/notifications';

export async function GET() {
  const testLead = {
    id: 'test-' + Date.now(),
    name: 'Test User',
    email: 'test@example.com',
    phone: '+15551234567',
    from_airport_or_city: 'LAX',
    to_airport_or_city: 'JFK',
    date_time: '2025-01-15T14:00',
    pax: 2,
    urgency: 'urgent' as const,
    notes: 'This is a test notification',
    timestamp: new Date().toISOString(),
  };

  console.log('[Test Notifications] Testing with lead:', testLead);

  // Check environment variables
  const envCheck = {
    email: {
      hasResendKey: !!process.env.RESEND_API_KEY,
      hasEmailTo: !!process.env.LEADS_NOTIFY_EMAIL_TO,
      hasEmailFrom: !!process.env.LEADS_NOTIFY_EMAIL_FROM,
      emailTo: process.env.LEADS_NOTIFY_EMAIL_TO,
      emailFrom: process.env.LEADS_NOTIFY_EMAIL_FROM,
    },
    vapi: {
      hasVapiKey: !!process.env.VAPI_API_KEY,
      hasPhoneNumberId: !!process.env.VAPI_PHONE_NUMBER_ID,
      hasNotifyPhone: !!process.env.VAPI_NOTIFY_PHONE,
      notifyPhone: process.env.VAPI_NOTIFY_PHONE,
    },
    webhook: {
      hasWebhookUrl: !!process.env.N8N_WEBHOOK_URL,
      webhookUrl: process.env.N8N_WEBHOOK_URL,
    },
  };

  console.log('[Test Notifications] Environment check:', envCheck);

  try {
    await sendNotifications(testLead);

    return NextResponse.json({
      success: true,
      message: 'Test notifications sent',
      envCheck,
      testLead,
    });
  } catch (error) {
    console.error('[Test Notifications] Error:', error);

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      envCheck,
      testLead,
    });
  }
}
