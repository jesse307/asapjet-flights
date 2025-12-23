import { NextRequest, NextResponse } from 'next/server';
import { Lead } from '@/types/lead';

export async function POST(request: NextRequest) {
  try {
    const lead: Lead = await request.json();

    // Only make Bland call if configured
    if (!process.env.BLAND_API_KEY || !process.env.BLAND_NOTIFY_PHONE) {
      console.log('Bland not configured, skipping voice notification');
      return NextResponse.json({ success: true, skipped: true });
    }

    const urgencyLabel = lead.urgency === 'critical' ? 'CRITICAL' : lead.urgency === 'urgent' ? 'URGENT' : 'Standard';

    // Create the call script for Bland
    const callScript = `
      Hi, this is an automated notification from ASAP Jet.

      You have a new ${urgencyLabel} charter lead.

      Passenger name: ${lead.name}

      Route: ${lead.from_airport_or_city} to ${lead.to_airport_or_city}

      Departure: ${lead.date_time}

      Number of passengers: ${lead.pax}

      Contact phone: ${lead.phone}

      Contact email: ${lead.email}

      ${lead.notes ? `Notes: ${lead.notes}` : ''}

      This lead was submitted at ${new Date(lead.timestamp).toLocaleString()}.

      Lead ID: ${lead.id}

      You can view full details in your admin dashboard. Thank you.
    `.trim();

    // Make Bland API call
    const response = await fetch('https://api.bland.ai/v1/calls', {
      method: 'POST',
      headers: {
        'Authorization': process.env.BLAND_API_KEY!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone_number: process.env.BLAND_NOTIFY_PHONE,
        task: callScript,
        voice: 'maya', // Professional female voice
        max_duration: 3, // 3 minutes max
        record: true,
        wait_for_greeting: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`Bland API failed: ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      callId: data.call_id,
      status: data.status
    });

  } catch (error) {
    console.error('Bland notification error:', error);
    return NextResponse.json(
      { success: false, error: 'Notification failed' },
      { status: 500 }
    );
  }
}
