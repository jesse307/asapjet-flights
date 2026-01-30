import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { MarketingAI, MARKETING_CONFIG } from '@/lib/marketing-ai';
import {
  getCampaignPerformance,
  getTodaySpend,
  updateCampaignBudget,
  pauseCampaign,
  isConfigured,
  getMissingConfig,
} from '@/lib/google-ads';

/**
 * Marketing AI Optimization Endpoint
 *
 * This runs 3x daily via Vercel Cron to optimize ad campaigns autonomously.
 * Schedule: Daily at 8 AM, 2 PM, 8 PM EST
 *
 * Flow:
 * 1. Fetch campaign performance from Google Ads API
 * 2. Analyze with Claude AI
 * 3. Apply optimizations (budget changes, pause underperformers)
 * 4. Log all decisions to database
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const log: string[] = [];

  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    // In production, require auth. In dev, allow unauthenticated
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    log.push(`[${new Date().toISOString()}] Starting optimization run`);

    // Check if marketing AI is enabled
    if (process.env.MARKETING_AI_ENABLED === 'false') {
      log.push('Marketing AI disabled via environment variable');
      return NextResponse.json({ status: 'disabled', log });
    }

    // Initialize Supabase for logging
    const supabaseUrl = process.env.NEXT_PUBLIC_asapflight_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.asapflight_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

    const supabase = supabaseUrl && supabaseKey
      ? createClient(supabaseUrl, supabaseKey)
      : null;

    // Check if Google Ads API is configured
    const googleAdsConfigured = isConfigured();

    if (!googleAdsConfigured) {
      const missing = getMissingConfig();
      log.push(`Google Ads API not fully configured. Missing: ${missing.join(', ')}`);

      // Fall back to database-only mode if Google Ads isn't configured
      if (!supabase) {
        return NextResponse.json({
          status: 'error',
          error: 'Neither Google Ads API nor Supabase configured',
          missing,
          log,
        }, { status: 500 });
      }

      // Use database data instead
      return await runDatabaseOnlyOptimization(supabase, log, startTime);
    }

    // ====== GOOGLE ADS API MODE ======
    log.push('Using Google Ads API for campaign data');

    // 1. Fetch campaign performance from Google Ads
    log.push('Fetching campaign performance from Google Ads...');
    const campaigns = await getCampaignPerformance(7);
    log.push(`Found ${campaigns.length} campaigns`);

    if (campaigns.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No campaigns found',
        log,
      });
    }

    // 2. Check today's spend against daily limit
    const todaySpend = await getTodaySpend();
    log.push(`Today's spend: $${todaySpend.toFixed(2)} / $${MARKETING_CONFIG.budget.dailyMax}`);

    if (todaySpend >= MARKETING_CONFIG.budget.dailyMax) {
      log.push('Daily budget limit reached - skipping optimizations');

      if (supabase) {
        await supabase.from('ai_optimization_log').insert({
          action_type: 'daily_limit_reached',
          details: { todaySpend, limit: MARKETING_CONFIG.budget.dailyMax },
          reason: 'Daily budget limit reached',
          applied: false,
        });
      }

      return NextResponse.json({
        success: true,
        message: 'Daily budget limit reached',
        todaySpend,
        log,
      });
    }

    // 3. Analyze with Marketing AI
    log.push('Analyzing performance with Marketing AI...');
    const ai = new MarketingAI();

    const campaignData = campaigns.map(c => ({
      id: c.campaignId,
      name: c.campaignName,
      platform: 'google' as const,
      impressions: c.impressions,
      clicks: c.clicks,
      conversions: c.conversions,
      spend: c.cost,
      ctr: c.ctr,
      cpc: c.cpc,
      conversionRate: c.conversionRate,
      costPerConversion: c.costPerConversion,
    }));

    const optimizationPlan = await ai.analyzePerformance(campaignData);
    log.push('AI analysis complete');

    // 4. Apply optimizations to Google Ads
    const actions: any[] = [];

    // Apply budget changes
    for (const change of optimizationPlan.budgetChanges || []) {
      try {
        // Safety check: don't exceed 20% change
        const maxChange = change.currentBudget * MARKETING_CONFIG.optimization.bidAdjustmentMax;
        const actualChange = Math.abs(change.newBudget - change.currentBudget);

        if (actualChange > maxChange) {
          log.push(`Skipping large budget change for campaign ${change.campaignId}: ${actualChange.toFixed(2)} > ${maxChange.toFixed(2)}`);
          continue;
        }

        // Safety check: don't exceed daily max
        let newBudget = change.newBudget;
        if (newBudget > MARKETING_CONFIG.budget.dailyMax) {
          newBudget = MARKETING_CONFIG.budget.dailyMax;
        }

        await updateCampaignBudget(change.campaignId, newBudget);
        log.push(`Updated budget for campaign ${change.campaignId}: $${change.currentBudget} -> $${newBudget}`);

        actions.push({
          type: 'budget_update',
          campaignId: change.campaignId,
          oldBudget: change.currentBudget,
          newBudget,
          reason: change.reason,
        });

        if (supabase) {
          await supabase.from('ai_optimization_log').insert({
            action_type: 'budget_change',
            campaign_id: change.campaignId,
            details: { oldBudget: change.currentBudget, newBudget },
            reason: change.reason,
            applied: true,
          });
        }
      } catch (err) {
        log.push(`Failed to update budget for campaign ${change.campaignId}: ${err}`);
      }
    }

    // Pause underperforming campaigns (CPL > $30 with enough data)
    for (const campaignId of optimizationPlan.pauseCampaigns || []) {
      try {
        const campaign = campaigns.find(c => c.campaignId === campaignId);

        // Only pause if we have enough data (30+ clicks) and CPL is bad
        if (campaign && campaign.costPerConversion > 30 && campaign.clicks >= MARKETING_CONFIG.optimization.minDataPoints) {
          await pauseCampaign(campaignId);
          log.push(`Paused underperforming campaign: ${campaignId} (CPL: $${campaign.costPerConversion.toFixed(2)})`);

          actions.push({
            type: 'pause_campaign',
            campaignId,
            reason: `CPL $${campaign.costPerConversion.toFixed(2)} exceeds $30 threshold`,
          });

          if (supabase) {
            await supabase.from('ai_optimization_log').insert({
              action_type: 'pause_campaign',
              campaign_id: campaignId,
              details: { costPerConversion: campaign.costPerConversion, clicks: campaign.clicks },
              reason: `CPL $${campaign.costPerConversion.toFixed(2)} exceeds $30 threshold`,
              applied: true,
            });
          }
        } else {
          log.push(`Skipping pause for campaign ${campaignId}: insufficient data or CPL within limits`);
        }
      } catch (err) {
        log.push(`Failed to pause campaign ${campaignId}: ${err}`);
      }
    }

    // 5. Generate new ad copy suggestions (logged but not auto-applied)
    try {
      const newAds = await ai.generateAdCopy([]);
      if (newAds.length > 0 && supabase) {
        await supabase.from('ai_optimization_log').insert({
          action_type: 'new_ad_copy_suggestion',
          details: { ads: newAds },
          reason: `Generated ${newAds.length} new ad variations for review`,
          applied: false,
        });
        log.push(`Generated ${newAds.length} new ad copy suggestions`);
      }
    } catch (err) {
      log.push(`Failed to generate ad copy: ${err}`);
    }

    // Log summary
    log.push(`Optimization complete. Actions taken: ${actions.length}`);

    return NextResponse.json({
      status: 'success',
      timestamp: new Date().toISOString(),
      summary: {
        campaignsAnalyzed: campaigns.length,
        todaySpend,
        actionsApplied: actions.length,
        durationMs: Date.now() - startTime,
      },
      actions,
      log,
    });

  } catch (error) {
    log.push(`Error: ${error}`);
    console.error('[Marketing AI] Optimization failed:', error);

    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      log,
    }, { status: 500 });
  }
}

/**
 * Fallback: Run optimization using database data only
 * (when Google Ads API is not configured)
 */
async function runDatabaseOnlyOptimization(
  supabase: any,
  log: string[],
  startTime: number
) {
  log.push('Running in database-only mode (Google Ads API not configured)');

  // Fetch recent performance data from database
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
      ?.filter((p: any) => {
        const daysDiff = (Date.now() - new Date(p.date).getTime()) / (1000 * 60 * 60 * 24);
        return daysDiff <= 7;
      })
      .reduce((acc: any, perf: any) => ({
        impressions: acc.impressions + perf.impressions,
        clicks: acc.clicks + perf.clicks,
        conversions: acc.conversions + perf.conversions,
        spend: acc.spend + parseFloat(perf.spend),
      }), { impressions: 0, clicks: 0, conversions: 0, spend: 0 }) || { impressions: 0, clicks: 0, conversions: 0, spend: 0 };

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

  log.push(`Analyzing ${campaignPerformance.length} campaigns from database`);

  // Analyze with AI
  const ai = new MarketingAI();
  const optimizationPlan = await ai.analyzePerformance(campaignPerformance);

  // Log recommendations (but don't auto-apply without Google Ads API)
  await supabase.from('ai_optimization_log').insert({
    action_type: 'optimization_recommendation',
    details: optimizationPlan,
    reason: 'Generated recommendations (manual review required - Google Ads API not configured)',
    applied: false,
  });

  return NextResponse.json({
    status: 'success',
    mode: 'database-only',
    timestamp: new Date().toISOString(),
    summary: {
      campaignsAnalyzed: campaignPerformance.length,
      durationMs: Date.now() - startTime,
    },
    recommendations: optimizationPlan,
    log,
    note: 'Recommendations generated but not auto-applied. Configure Google Ads API for automated optimization.',
  });
}

// Support POST for manual triggers
export async function POST(request: NextRequest) {
  return GET(request);
}
