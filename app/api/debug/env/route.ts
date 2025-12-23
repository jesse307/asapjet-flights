import { NextRequest, NextResponse } from 'next/server';

// Diagnostic endpoint to check environment variables
// DELETE THIS FILE AFTER DEBUGGING
export async function GET(request: NextRequest) {
  // Check admin password from query string for easy browser access
  const { searchParams } = new URL(request.url);
  const password = searchParams.get('password');

  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({
      error: 'Unauthorized',
      message: 'Add ?password=YOUR_ADMIN_PASSWORD to the URL'
    }, { status: 401 });
  }

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    environment: {
      // Resend Email Config
      resend: {
        hasApiKey: !!process.env.RESEND_API_KEY,
        apiKeyPrefix: process.env.RESEND_API_KEY?.substring(0, 10) + '...',
        hasEmailTo: !!process.env.LEADS_NOTIFY_EMAIL_TO,
        emailTo: process.env.LEADS_NOTIFY_EMAIL_TO,
        hasEmailFrom: !!process.env.LEADS_NOTIFY_EMAIL_FROM,
        emailFrom: process.env.LEADS_NOTIFY_EMAIL_FROM,
      },
      // VAPI Config
      vapi: {
        hasApiKey: !!process.env.VAPI_API_KEY,
        apiKeyPrefix: process.env.VAPI_API_KEY?.substring(0, 10) + '...',
        hasPhoneNumberId: !!process.env.VAPI_PHONE_NUMBER_ID,
        phoneNumberId: process.env.VAPI_PHONE_NUMBER_ID,
        hasNotifyPhone: !!process.env.VAPI_NOTIFY_PHONE,
        notifyPhone: process.env.VAPI_NOTIFY_PHONE,
      },
      // Supabase Config
      supabase: {
        hasUrl: !!process.env.NEXT_PUBLIC_asapflight_SUPABASE_URL,
        url: process.env.NEXT_PUBLIC_asapflight_SUPABASE_URL,
        hasServiceKey: !!process.env.asapflight_SUPABASE_SERVICE_ROLE_KEY,
        serviceKeyPrefix: process.env.asapflight_SUPABASE_SERVICE_ROLE_KEY?.substring(0, 20) + '...',
      },
      // Webhook
      webhook: {
        hasN8nUrl: !!process.env.N8N_WEBHOOK_URL,
        n8nUrl: process.env.N8N_WEBHOOK_URL,
      },
    },
    emailNotificationEnabled: !!(
      process.env.RESEND_API_KEY &&
      process.env.LEADS_NOTIFY_EMAIL_TO &&
      process.env.LEADS_NOTIFY_EMAIL_FROM
    ),
    vapiNotificationEnabled: !!(
      process.env.VAPI_API_KEY &&
      process.env.VAPI_PHONE_NUMBER_ID &&
      process.env.VAPI_NOTIFY_PHONE
    ),
  });
}
