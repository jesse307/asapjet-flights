import { NextResponse } from 'next/server';

export async function GET() {
  const config = {
    hasVapiKey: !!process.env.VAPI_API_KEY,
    hasPhoneNumberId: !!process.env.VAPI_PHONE_NUMBER_ID,
    hasNotifyPhone: !!process.env.VAPI_NOTIFY_PHONE,
    vapiKeyPrefix: process.env.VAPI_API_KEY?.substring(0, 10),
    phoneNumberId: process.env.VAPI_PHONE_NUMBER_ID,
    notifyPhone: process.env.VAPI_NOTIFY_PHONE,
  };

  console.log('[Test VAPI] Configuration check:', config);

  // Try to make a test VAPI call
  if (config.hasVapiKey && config.hasPhoneNumberId && config.hasNotifyPhone) {
    try {
      console.log('[Test VAPI] Attempting test call...');

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
            firstMessage: 'This is a test call from ASAP Jet. If you are hearing this, VAPI is working correctly.',
            model: {
              provider: 'openai',
              model: 'gpt-3.5-turbo',
              messages: [
                {
                  role: 'system',
                  content: 'You are a test assistant. Just deliver the message and end the call.'
                }
              ]
            },
            voice: {
              provider: '11labs',
              voiceId: 'rachel'
            }
          }
        }),
      });

      const responseText = await response.text();
      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch {
        responseData = responseText;
      }

      console.log('[Test VAPI] Response status:', response.status);
      console.log('[Test VAPI] Response data:', responseData);

      return NextResponse.json({
        config,
        callAttempted: true,
        callSuccess: response.ok,
        callStatus: response.status,
        callResponse: responseData,
      });
    } catch (error) {
      console.error('[Test VAPI] Error:', error);
      return NextResponse.json({
        config,
        callAttempted: true,
        callSuccess: false,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return NextResponse.json({
    config,
    callAttempted: false,
    message: 'Missing VAPI environment variables',
  });
}
