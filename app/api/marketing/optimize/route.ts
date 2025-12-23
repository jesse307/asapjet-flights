import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { MarketingAI, MARKETING_CONFIG } from '@/lib/marketing-ai';

/**
 * Marketing AI Optimization Endpoint
 *
 * This runs daily via Vercel Cron to optimize ad campaigns autonomously.
 *
 * Schedule: Daily at 8 AM, 2 PM, 8 PM EST
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('[Marketing AI] Starting daily optimization run...');

    // Check if marketing AI is enabled
    if (process.env.MARKETING_AI_ENABLED === 'false') {
      console.log('[Marketing AI] Disabled via environment variable');
      return NextResponse.json({ status: 'disabled' });
    }

    // Initialize Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_asapflight_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.asapflight_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase credentials not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch recent performance data
    const { data: campaigns, error: campaignsError } = await supabase
      .from('ad_campaigns')
      .select('*, ad_performance(*)')
      .eq('status', 'active');

    if (campaignsError) {
      throw new Error(`Failed to fetch campaigns: ${campaignsError.message}`);
    }

    // Calculate aggregate metrics for each campaign
    const campaignPerformance = campaigns?.map((campaign: any) => {
      const last7Days = campaign.ad_performance
        .filter((p: any) => {
          const daysDiff = (Date.now() - new Date(p.date).getTime()) / (1000 * 60 * 60 * 24);
          return daysDiff <= 7;
        })
        .reduce((acc: any, perf: any) => ({
          impressions: acc.impressions + perf.impressions,
          clicks: acc.clicks + perf.clicks,
          conversions: acc.conversions + perf.conversions,
          spend: acc.spend + parseFloat(perf.spend),
        }), { impressions: 0, clicks: 0, conversions: 0, spend: 0 });

      return {
        id: campaign.id,
        name: campaign.name,
        platform: campaign.platform,
        impressions: last7Days.impressions,
        clicks: last7Days.clicks,
        conversions: last7Days.conversions,
        spend: last7Days.spend,
        ctr: last7Days.clicks / (last7Days.impressions || 1),
        cpc: last7Days.spend / (last7Days.clicks || 1),
        conversionRate: last7Days.conversions / (last7Days.clicks || 1),
        costPerConversion: last7Days.spend / (last7Days.conversions || 1),
      };
    }) || [];

    console.log('[Marketing AI] Analyzing performance for', campaignPerformance.length, 'campaigns');

    // Initialize Marketing AI
    const ai = new MarketingAI();

    // Get optimization plan from AI
    const optimizationPlan = await ai.analyzePerformance(campaignPerformance);

    console.log('[Marketing AI] Generated optimization plan:', optimizationPlan);

    // Apply budget changes
    for (const change of optimizationPlan.budgetChanges) {
      const { error } = await supabase
        .from('ad_campaigns')
        .update({ daily_budget: change.newBudget })
        .eq('id', change.campaignId);

      if (error) {
        console.error('[Marketing AI] Failed to update budget:', error);
      } else {
        // Log the decision
        await supabase.from('ai_optimization_log').insert({
          action_type: 'budget_change',
          campaign_id: change.campaignId,
          details: change,
          reason: change.reason,
          applied: true,
        });
      }
    }

    // Pause underperforming campaigns
    for (const campaignId of optimizationPlan.pauseCampaigns) {
      const { error } = await supabase
        .from('ad_campaigns')
        .update({ status: 'paused' })
        .eq('id', campaignId);

      if (error) {
        console.error('[Marketing AI] Failed to pause campaign:', error);
      } else {
        const campaign = campaignPerformance.find(c => c.id === campaignId);
        await supabase.from('ai_optimization_log').insert({
          action_type: 'pause_campaign',
          campaign_id: campaignId,
          details: { campaign },
          reason: `Underperforming: CPL $${campaign?.costPerConversion?.toFixed(2)} exceeds target`,
          applied: true,
        });
      }
    }

    // Generate new ad copy variations for Google Search
    const existing = await supabase
      .from('ad_copy')
      .select('*')
      .eq('platform', 'google')
      .eq('status', 'active');

    const newAds = await ai.generateAdCopy(existing.data || []);

    // Log new ad copy
    if (newAds.length > 0) {
      await supabase.from('ai_optimization_log').insert({
        action_type: 'new_ad_copy',
        details: { platform: 'google', ads: newAds },
        reason: `Generated ${newAds.length} new Google Search ad variations for testing`,
        applied: false, // Requires manual review
      });
    }

    // Get daily budget for Google Search
    const dailyBudget = ai.getDailyBudget();

    console.log('[Marketing AI] Daily budget for Google Search:', dailyBudget);

    // Return summary
    return NextResponse.json({
      status: 'success',
      timestamp: new Date().toISOString(),
      summary: {
        campaignsAnalyzed: campaignPerformance.length,
        budgetChanges: optimizationPlan.budgetChanges.length,
        campaignsPaused: optimizationPlan.pauseCampaigns.length,
        newAdCopyGenerated: newAds.length,
        dailyBudget,
      },
      optimizationPlan,
    });

  } catch (error) {
    console.error('[Marketing AI] Optimization failed:', error);
    return NextResponse.json(
      {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Support POST for manual triggers
export async function POST(request: NextRequest) {
  return GET(request);
}
