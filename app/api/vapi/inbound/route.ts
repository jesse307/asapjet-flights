import { NextRequest, NextResponse } from 'next/server';
import { saveLead } from '@/lib/leads-store';
import { sendNotifications } from '@/lib/notifications';

// VAPI inbound call webhook - creates leads from phone calls
// This endpoint receives VAPI function calls with lead data
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log('[VAPI Inbound] ========== NEW REQUEST ==========');
    console.log('[VAPI Inbound] Full raw payload:', JSON.stringify(body, null, 2));
    console.log('[VAPI Inbound] Payload keys:', Object.keys(body));
    console.log('[VAPI Inbound] Payload type:', typeof body);

    // Try multiple extraction paths - VAPI can send data in different formats
    let leadParams: any = {};

    // Path 1: Direct parameters (tool call)
    if (body.from_airport_or_city || body.departure) {
      console.log('[VAPI Inbound] Path 1: Using direct body parameters');
      leadParams = body;
    }
    // Path 2: Nested in message.toolCalls
    else if (body.message?.toolCalls?.[0]?.function?.arguments) {
      console.log('[VAPI Inbound] Path 2: Using message.toolCalls');
      const args = body.message.toolCalls[0].function.arguments;
      leadParams = typeof args === 'string' ? JSON.parse(args) : args;
    }
    // Path 3: Nested in call.messages
    else if (body.call?.messages) {
      console.log('[VAPI Inbound] Path 3: Searching call.messages');
      const messages = body.call.messages;
      for (const msg of messages) {
        if (msg.toolCalls?.[0]?.function?.arguments) {
          const args = msg.toolCalls[0].function.arguments;
          leadParams = typeof args === 'string' ? JSON.parse(args) : args;
          break;
        }
      }
    }
    // Path 4: Analysis/transcript fallback
    else if (body.call?.analysis || body.call?.transcript) {
      console.log('[VAPI Inbound] Path 4: Using analysis/transcript');
      const analysis = body.call.analysis || {};
      leadParams = analysis.successEvaluationVariables || {};
    }

    console.log('[VAPI Inbound] Extracted lead parameters:', JSON.stringify(leadParams, null, 2));

    // Apply defaults and transformations - be forgiving, capture every lead
    const processedData = {
      from_airport_or_city: leadParams.from_airport_or_city || leadParams.departure || 'Not provided',
      to_airport_or_city: leadParams.to_airport_or_city || leadParams.destination || 'Not provided',
      date_time: leadParams.date_time || leadParams.departure_date || 'To be confirmed',
      pax: typeof leadParams.pax === 'string' ? parseInt(leadParams.pax, 10) : (leadParams.pax || 1),
      name: leadParams.name || 'Phone Lead',
      phone: leadParams.phone || 'Not provided',
      email: leadParams.email || 'noemail@phonelead.com',
      urgency: (leadParams.urgency as 'normal' | 'urgent' | 'critical') || 'urgent',
      notes: leadParams.notes || undefined,
    };

    console.log('[VAPI Inbound] Prepared lead data:', processedData);

    // Save lead to database using processed data
    const lead = await saveLead(processedData);
    console.log('[VAPI Inbound] Lead saved successfully:', lead.id);

    // Send notifications (email, etc.)
    sendNotifications(lead).catch((error) => {
      console.error('[VAPI Inbound] Notification error:', error);
    });

    return NextResponse.json({
      success: true,
      leadId: lead.id,
      message: 'Lead created from phone call',
    });

  } catch (error) {
    console.error('[VAPI Inbound] Error processing call:', error);

    // Log detailed error information
    if (error instanceof Error) {
      console.error('[VAPI Inbound] Error message:', error.message);
      console.error('[VAPI Inbound] Error stack:', error.stack);
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process call data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Support GET for health check
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'vapi-inbound-webhook',
    endpoint: 'Use POST to submit call data'
  });
}
