import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    // Check admin password
    const authHeader = request.headers.get('authorization');
    const password = authHeader?.replace('Bearer ', '');

    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get lead ID from query params
    const { searchParams } = new URL(request.url);
    const leadId = searchParams.get('leadId');

    if (!leadId) {
      return NextResponse.json({ error: 'Lead ID is required' }, { status: 400 });
    }

    // Get Supabase credentials
    const supabaseUrl = process.env.NEXT_PUBLIC_asapflight_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey =
      process.env.asapflight_SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_asapflight_SUPABASE_ANON_KEY ||
      process.env.asapflight_SUPABASE_JWT_SECRET;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('[Call Logs API] Supabase not configured');
      return NextResponse.json({ callLogs: [] });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch call logs for this lead
    const { data, error } = await supabase
      .from('call_logs')
      .select('*')
      .eq('lead_id', leadId)
      .order('timestamp', { ascending: false });

    if (error) {
      console.error('[Call Logs API] Error fetching call logs:', error);
      return NextResponse.json({ callLogs: [] });
    }

    return NextResponse.json({ callLogs: data || [] });

  } catch (error) {
    console.error('[Call Logs API] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
