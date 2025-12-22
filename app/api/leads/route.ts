import { NextRequest, NextResponse } from 'next/server';
import { leadSchema } from '@/lib/validations';
import { saveLead } from '@/lib/leads-store';
import { sendNotifications } from '@/lib/notifications';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validatedData = leadSchema.parse(body);

    // Save lead
    const lead = await saveLead(validatedData);

    // Send notifications (non-blocking)
    sendNotifications(lead).catch((error) => {
      console.error('Notification error:', error);
    });

    return NextResponse.json(
      { success: true, leadId: lead.id },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: 'Invalid form data', details: error },
        { status: 400 }
      );
    }

    console.error('Lead submission error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
