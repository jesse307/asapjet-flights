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
