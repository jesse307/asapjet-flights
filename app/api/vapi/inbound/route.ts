import { NextRequest, NextResponse } from 'next/server';
import { saveLead } from '@/lib/leads-store';
import { sendNotifications } from '@/lib/notifications';

// VAPI inbound call webhook - creates leads from phone calls
// This endpoint receives VAPI function calls with lead data
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log('[VAPI Inbound] Raw payload:', JSON.stringify(body, null, 2));

    // VAPI sends function call data directly as the body when configured as a tool
    // The body IS the parameters object
    const leadParams = body;

    console.log('[VAPI Inbound] Parsing lead parameters:', leadParams);

    // Validate we have the minimum required fields
    if (!leadParams.from_airport_or_city || !leadParams.to_airport_or_city) {
      console.error('[VAPI Inbound] Missing required fields in payload:', leadParams);
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: from_airport_or_city and to_airport_or_city',
          received: leadParams
        },
        { status: 400 }
      );
    }

    // Ensure pax is a number
    if (typeof leadParams.pax === 'string') {
      leadParams.pax = parseInt(leadParams.pax, 10);
    }

    // Ensure urgency is set
    if (!leadParams.urgency) {
      leadParams.urgency = 'urgent';
    }

    // Ensure email has a valid format (at least a placeholder)
    if (!leadParams.email || leadParams.email === '') {
      leadParams.email = 'noemail@phonelead.com';
    }

    console.log('[VAPI Inbound] Prepared lead data:', leadParams);

    // Save lead to database
    const lead = await saveLead(leadParams);
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
