import { NextRequest, NextResponse } from 'next/server';
import { leadSchema } from '@/lib/validations';
import { saveLead } from '@/lib/leads-store';
import { sendNotifications } from '@/lib/notifications';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log('[Leads API] ========== NEW REQUEST ==========');
    console.log('[Leads API] Raw body:', JSON.stringify(body, null, 2));
    console.log('[Leads API] Body keys:', Object.keys(body));

    // Validate input
    const validatedData = leadSchema.parse(body);

    console.log('[Leads API] Validation passed:', validatedData);

    // Save lead
    const lead = await saveLead(validatedData);

    console.log('[Leads API] Lead saved:', lead.id);

    // Send notifications (non-blocking)
    sendNotifications(lead).catch((error) => {
      console.error('Notification error:', error);
    });

    return NextResponse.json(
      { success: true, leadId: lead.id },
      { status: 201 }
    );
  } catch (error) {
    console.error('[Leads API] Error:', error);

    if (error instanceof Error && error.name === 'ZodError') {
      console.error('[Leads API] Validation error details:', JSON.stringify(error, null, 2));
      return NextResponse.json(
        { success: false, error: 'Invalid form data', details: error },
        { status: 400 }
      );
    }

    console.error('[Leads API] Submission error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
