import { NextResponse } from 'next/server';

export async function GET() {
  const deploymentTime = new Date().toISOString();
  const envCheck = {
    hasResendKey: !!process.env.RESEND_API_KEY,
    hasVapiKey: !!process.env.VAPI_API_KEY,
    hasVapiPhoneId: !!process.env.VAPI_PHONE_NUMBER_ID,
    hasVapiNotifyPhone: !!process.env.VAPI_NOTIFY_PHONE,
    vapiPhoneId: process.env.VAPI_PHONE_NUMBER_ID?.substring(0, 8) + '...',
    notifyPhone: process.env.VAPI_NOTIFY_PHONE,
  };

  console.log('[Health Check] Environment:', envCheck);

  return NextResponse.json({
    status: 'ok',
    timestamp: deploymentTime,
    environment: envCheck,
    version: '2025-12-24-vapi-fix',
  });
}
