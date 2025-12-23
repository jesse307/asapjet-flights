import { NextRequest, NextResponse } from 'next/server';
import { saveLead } from '@/lib/leads-store';
import { sendNotifications } from '@/lib/notifications';

// VAPI inbound call webhook - creates leads from phone calls
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log('[VAPI Inbound] Received call data:', {
      callId: body.call?.id,
      phoneNumber: body.call?.customer?.number,
    });

    // Extract lead information from VAPI call data
    // Adjust these paths based on how your VAPI assistant structures the data
    const callData = body.message || body;
    const transcript = callData.transcript || '';
    const metadata = callData.call?.metadata || {};

    // You'll need to extract the specific fields from your VAPI response
    // This is a template - adjust based on your VAPI assistant's output structure
    const leadData = {
      // Extract from VAPI variables/metadata
      from_airport_or_city: metadata.from_airport || metadata.departure || extractFromTranscript(transcript, 'from'),
      to_airport_or_city: metadata.to_airport || metadata.arrival || extractFromTranscript(transcript, 'to'),
      date_time: metadata.date_time || metadata.departure_date || 'To be confirmed',
      pax: parseInt(metadata.passengers || metadata.pax || '1', 10),
      name: metadata.name || callData.call?.customer?.name || 'Phone Lead',
      phone: metadata.phone || callData.call?.customer?.number || 'Unknown',
      email: metadata.email || 'noemail@phonelead.com', // Phone leads may not have email
      urgency: 'urgent' as const, // All phone calls are urgent
      notes: `Phone call lead. Call ID: ${callData.call?.id || 'unknown'}. ${metadata.notes || transcript || ''}`,
    };

    console.log('[VAPI Inbound] Extracted lead data:', leadData);

    // Validate required fields
    if (!leadData.from_airport_or_city || !leadData.to_airport_or_city) {
      console.error('[VAPI Inbound] Missing required fields:', leadData);
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required lead information',
          received: leadData
        },
        { status: 400 }
      );
    }

    // Save lead to database
    const lead = await saveLead(leadData);
    console.log('[VAPI Inbound] Lead saved:', lead.id);

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

// Helper function to extract info from transcript
// You can enhance this based on your needs
function extractFromTranscript(transcript: string, field: 'from' | 'to'): string {
  // Simple extraction - you may want to use more sophisticated parsing
  const text = transcript.toLowerCase();

  if (field === 'from') {
    const fromMatch = text.match(/from\s+([a-z\s]+?)(?:\s+to|\.|,|$)/i);
    return fromMatch ? fromMatch[1].trim() : 'To be confirmed';
  } else {
    const toMatch = text.match(/to\s+([a-z\s]+?)(?:\.|,|$)/i);
    return toMatch ? toMatch[1].trim() : 'To be confirmed';
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
