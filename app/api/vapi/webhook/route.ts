import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// VAPI webhook handler for call status updates
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log('[VAPI Webhook] Received event:', body.type);

    // Get Supabase credentials
    const supabaseUrl = process.env.NEXT_PUBLIC_asapflight_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey =
      process.env.asapflight_SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_asapflight_SUPABASE_ANON_KEY ||
      process.env.asapflight_SUPABASE_JWT_SECRET;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('[VAPI Webhook] Supabase not configured');
      return NextResponse.json({ success: false, error: 'Database not configured' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Handle different event types
    const eventType = body.message?.type || body.type;
    const callId = body.message?.call?.id || body.call?.id;
    const leadId = body.message?.call?.metadata?.leadId || body.call?.metadata?.leadId;

    if (!callId) {
      console.warn('[VAPI Webhook] No call ID in webhook payload');
      return NextResponse.json({ success: true, skipped: true });
    }

    // Map VAPI event types to our status
    let status = eventType;
    let callData: any = {
      status: eventType,
      updated_at: new Date().toISOString(),
    };

    // Extract additional data based on event type
    switch (eventType) {
      case 'call.started':
        callData.started_at = body.message?.call?.startedAt || new Date().toISOString();
        status = 'in-progress';
        break;

      case 'call.ended':
        callData.ended_at = body.message?.call?.endedAt;
        callData.duration = body.message?.call?.duration;
        callData.cost = body.message?.call?.cost;
        status = 'completed';
        break;

      case 'call.failed':
        callData.error = body.message?.call?.error || body.error;
        status = 'failed';
        break;

      case 'transcript':
        // Store transcript if needed
        callData.transcript = body.message?.transcript;
        break;
    }

    // Update or insert call log
    const { error: upsertError } = await supabase
      .from('call_logs')
      .upsert(
        {
          call_id: callId,
          lead_id: leadId,
          ...callData,
        },
        {
          onConflict: 'call_id',
        }
      );

    if (upsertError) {
      console.error('[VAPI Webhook] Failed to update call log:', upsertError);
      return NextResponse.json(
        { success: false, error: 'Failed to update call log' },
        { status: 500 }
      );
    }

    console.log('[VAPI Webhook] Call log updated:', { callId, status });

    return NextResponse.json({ success: true, callId, status });

  } catch (error) {
    console.error('[VAPI Webhook] Error processing webhook:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Support GET for health check
export async function GET() {
  return NextResponse.json({ status: 'ok', service: 'vapi-webhook' });
}
