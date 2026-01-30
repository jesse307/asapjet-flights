import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { updateCampaignBudget, pauseCampaign, enableCampaign } from '@/lib/google-ads';

export async function POST(request: NextRequest) {
  // Verify admin auth
  const authHeader = request.headers.get('authorization');
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword || authHeader !== `Bearer ${adminPassword}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_asapflight_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.asapflight_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const { id, approved } = await request.json();

    // Get the recommendation
    const { data: rec, error: fetchError } = await supabase
      .from('ai_recommendations')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !rec) {
      return NextResponse.json({ error: 'Recommendation not found' }, { status: 404 });
    }

    if (approved) {
      // Apply the recommendation to Google Ads
      try {
        switch (rec.type) {
          case 'budget_change':
            await updateCampaignBudget(rec.campaign_id, rec.details.newBudget);
            break;
          case 'pause_campaign':
            await pauseCampaign(rec.campaign_id);
            break;
          case 'enable_campaign':
            await enableCampaign(rec.campaign_id);
            break;
          // Other types don't auto-apply (like new_ad_copy which needs manual creation)
        }
      } catch (apiError) {
        console.error('Failed to apply to Google Ads:', apiError);
        return NextResponse.json({
          error: 'Failed to apply change to Google Ads',
          details: apiError instanceof Error ? apiError.message : 'Unknown error',
        }, { status: 500 });
      }
    }

    // Update the recommendation status
    const { error: updateError } = await supabase
      .from('ai_recommendations')
      .update({
        status: approved ? 'approved' : 'rejected',
        applied_at: approved ? new Date().toISOString() : null,
      })
      .eq('id', id);

    if (updateError) {
      throw updateError;
    }

    // Log the decision
    await supabase.from('ai_optimization_log').insert({
      action_type: approved ? 'recommendation_approved' : 'recommendation_rejected',
      campaign_id: rec.campaign_id,
      details: rec.details,
      reason: `${approved ? 'Approved' : 'Rejected'} by admin: ${rec.reason}`,
      applied: approved,
    });

    return NextResponse.json({ success: true, applied: approved });
  } catch (error) {
    console.error('Error processing approval:', error);
    return NextResponse.json({ error: 'Failed to process approval' }, { status: 500 });
  }
}
