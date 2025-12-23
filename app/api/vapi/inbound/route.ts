import { NextRequest, NextResponse } from 'next/server';
import { saveLead } from '@/lib/leads-store';
import { sendNotifications } from '@/lib/notifications';

// VAPI inbound call webhook - creates leads from phone calls
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log('[VAPI Inbound] Received webhook payload:', JSON.stringify(body, null, 2));

    // VAPI can send either:
    // 1. Function call with structured data (preferred)
    // 2. End-of-call webhook with analysis variables (fallback)

    const message = body.message || body;
    const call = message.call || body.call || {};
    const callId = call.id || 'unknown';
    const customerPhone = call.customer?.number || '';

    // Check if this is a function call with structured data
    const functionCall = message.functionCall || body.functionCall;
    let leadParams: any = {};

    if (functionCall && functionCall.name === 'submit_lead') {
      // Structured data from function call (best option)
      console.log('[VAPI Inbound] Using structured function call data');
      leadParams = functionCall.parameters || {};
    } else {
      // Fallback: Extract from analysis variables or transcript
      console.log('[VAPI Inbound] Using analysis variables (fallback)');
      const messages = message.messages || call.messages || [];
      const transcript = message.transcript || call.transcript || '';
      const analysis = call.analysis || {};
      leadParams = analysis.successEvaluationVariables || {};

      // If still no data, try to extract from transcript
      if (!leadParams.departure && !leadParams.destination) {
        leadParams.departure = extractFromTranscript(transcript, 'from');
        leadParams.destination = extractFromTranscript(transcript, 'to');
      }
    }

    console.log('[VAPI Inbound] Lead parameters:', leadParams);

    // Map VAPI parameters to our lead structure
    const leadData = {
      from_airport_or_city: leadParams.departure || leadParams.from || 'To be confirmed',
      to_airport_or_city: leadParams.destination || leadParams.to || 'To be confirmed',
      date_time: leadParams.date_time || leadParams.departure_date || 'To be confirmed',
      pax: parseInt(leadParams.passengers || leadParams.pax || '1', 10),
      name: leadParams.name || leadParams.caller_name || 'Phone Lead',
      phone: leadParams.phone || leadParams.callback_number || customerPhone || 'Unknown',
      email: leadParams.email || 'noemail@phonelead.com',
      urgency: 'urgent' as const,
      notes: buildNotes(callId, leadParams.special_requirements, leadParams.urgency, call.transcript),
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

// Helper function to build notes from collected data
function buildNotes(callId: string, specialRequirements?: string, urgency?: string, transcript?: string): string {
  const parts = [`Phone call lead. Call ID: ${callId}`];

  if (urgency) {
    parts.push(`Trip urgency: ${urgency}`);
  }

  if (specialRequirements) {
    parts.push(`Special requirements: ${specialRequirements}`);
  }

  if (transcript) {
    parts.push(`Transcript: ${transcript.substring(0, 500)}${transcript.length > 500 ? '...' : ''}`);
  }

  return parts.join('. ');
}

// Fallback: Extract info from transcript if variables are missing
function extractFromTranscript(transcript: string, field: 'from' | 'to'): string {
  if (!transcript) return 'To be confirmed';

  const text = transcript.toLowerCase();

  if (field === 'from') {
    const fromMatch = text.match(/(?:from|flying from|departing from|leaving from)\s+([a-z\s]+?)(?:\s+to|\.|,|$)/i);
    return fromMatch ? fromMatch[1].trim() : 'To be confirmed';
  } else {
    const toMatch = text.match(/(?:to|flying to|going to|arriving at)\s+([a-z\s]+?)(?:\.|,|$)/i);
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
