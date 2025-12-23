/**
 * ASAP Jet Marketing AI - Autonomous Ad Campaign Management
 *
 * This AI agent manages Google Ads and Meta (Facebook/Instagram) campaigns
 * with full autonomy to optimize for quote requests.
 */

import Anthropic from '@anthropic-ai/sdk';

// Marketing AI configuration
export const MARKETING_CONFIG = {
  // Budget allocation
  budget: {
    total: 1000, // Total monthly budget
    googleAds: 0.6, // 60% to Google (high intent search)
    metaAds: 0.4, // 40% to Meta (awareness + retargeting)
    dailyMax: 50, // Max spend per day to pace budget
  },

  // Performance targets
  targets: {
    costPerLead: 25, // Target cost per lead (form submission)
    costPerClick: 3, // Target CPC
    conversionRate: 0.05, // Target 5% conversion rate
    qualityScore: 7, // Minimum Google Ads quality score
  },

  // Optimization settings
  optimization: {
    checkFrequency: 'daily', // How often to review and adjust
    minDataPoints: 30, // Minimum clicks before making decisions
    bidAdjustmentMax: 0.2, // Max 20% bid changes at once
    pauseUnderperformers: true, // Auto-pause bad performers
  },

  // Ad copy testing
  adTesting: {
    variationsPerCampaign: 3, // Test 3 ad variants
    minImpressions: 1000, // Before declaring a winner
    rotateAds: 'optimize', // vs 'even' rotation
  },
};

/**
 * Marketing AI Agent - makes autonomous decisions about ad campaigns
 */
export class MarketingAI {
  private anthropic: Anthropic;

  constructor() {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY not configured');
    }
    this.anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }

  /**
   * Analyze campaign performance and generate optimization recommendations
   */
  async analyzePerformance(campaignData: CampaignPerformance[]): Promise<OptimizationPlan> {
    const prompt = `You are a performance marketing expert managing ad campaigns for ASAP Jet, a private air charter service.

CURRENT CAMPAIGN DATA:
${JSON.stringify(campaignData, null, 2)}

BUDGET & TARGETS:
- Total Budget: $${MARKETING_CONFIG.budget.total}/month
- Target Cost Per Lead: $${MARKETING_CONFIG.targets.costPerLead}
- Target CPC: $${MARKETING_CONFIG.targets.costPerClick}
- Target Conversion Rate: ${MARKETING_CONFIG.targets.conversionRate * 100}%

Analyze the performance and provide:
1. Which campaigns to increase/decrease budgets on
2. Which ads to pause (underperforming)
3. Bid adjustment recommendations
4. New ad copy suggestions to test
5. Audience targeting adjustments

Focus on IMMEDIATE QUOTE REQUESTS - we want high-intent customers who need charter flights now.

Return your response as a structured JSON plan with specific, actionable changes.`;

    const response = await this.anthropic.messages.create({
      model: 'claude-sonnet-4-5-20251105',
      max_tokens: 4000,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = response.content[0];
    if (content.type === 'text') {
      return JSON.parse(this.extractJSON(content.text));
    }

    throw new Error('Unexpected response format from AI');
  }

  /**
   * Generate new ad copy variations
   */
  async generateAdCopy(platform: 'google' | 'meta', existing: AdCopy[]): Promise<AdCopy[]> {
    const prompt = platform === 'google'
      ? this.getGoogleAdPrompt(existing)
      : this.getMetaAdPrompt(existing);

    const response = await this.anthropic.messages.create({
      model: 'claude-sonnet-4-5-20251105',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = response.content[0];
    if (content.type === 'text') {
      return JSON.parse(this.extractJSON(content.text));
    }

    throw new Error('Unexpected response format from AI');
  }

  /**
   * Decide daily budget allocation based on performance
   */
  async optimizeBudgetAllocation(performance: PlatformPerformance): Promise<BudgetAllocation> {
    const totalBudget = MARKETING_CONFIG.budget.dailyMax;

    // Simple algorithm: allocate based on ROI
    const googleROI = performance.google.conversions / performance.google.spend;
    const metaROI = performance.meta.conversions / performance.meta.spend;
    const totalROI = googleROI + metaROI;

    if (totalROI === 0) {
      // No data yet, use default allocation
      return {
        google: totalBudget * MARKETING_CONFIG.budget.googleAds,
        meta: totalBudget * MARKETING_CONFIG.budget.metaAds,
      };
    }

    // Allocate budget proportionally to ROI, but cap extremes
    const googleShare = Math.max(0.3, Math.min(0.8, googleROI / totalROI));

    return {
      google: totalBudget * googleShare,
      meta: totalBudget * (1 - googleShare),
    };
  }

  private getGoogleAdPrompt(existing: AdCopy[]): string {
    return `Generate 3 Google Search Ad variations for ASAP Jet private charter flights.

REQUIREMENTS:
- Headlines: Max 30 characters each (provide 3 headlines per ad)
- Descriptions: Max 90 characters each (provide 2 descriptions per ad)
- Focus on URGENCY and IMMEDIATE availability
- Keywords: last-minute flights, private jet, charter flights, ASAP

TARGET AUDIENCE: Business executives, urgent travelers, groups needing immediate air travel

EXISTING ADS (don't duplicate):
${JSON.stringify(existing, null, 2)}

Return as JSON array of ad objects with headlines and descriptions.`;
  }

  private getMetaAdPrompt(existing: AdCopy[]): string {
    return `Generate 3 Facebook/Instagram Ad variations for ASAP Jet private charter flights.

REQUIREMENTS:
- Primary Text: Max 125 characters (attention-grabbing)
- Headline: Max 40 characters
- Description: Max 30 characters
- Call-to-action: "Get Quote" or "Book Now"
- Focus on LUXURY + SPEED

TARGET AUDIENCE: 35-65, income $150k+, business travelers, luxury travel

EXISTING ADS (don't duplicate):
${JSON.stringify(existing, null, 2)}

Return as JSON array of ad objects.`;
  }

  private extractJSON(text: string): string {
    // Extract JSON from markdown code blocks
    const match = text.match(/```json\n?([\s\S]*?)\n?```/);
    if (match) {
      return match[1];
    }
    // Try to find JSON object directly
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    return jsonMatch ? jsonMatch[0] : text;
  }
}

// Type definitions
export interface CampaignPerformance {
  id: string;
  name: string;
  platform: 'google' | 'meta';
  impressions: number;
  clicks: number;
  conversions: number;
  spend: number;
  ctr: number;
  cpc: number;
  conversionRate: number;
  costPerConversion: number;
}

export interface OptimizationPlan {
  budgetChanges: Array<{
    campaignId: string;
    currentBudget: number;
    newBudget: number;
    reason: string;
  }>;
  bidAdjustments: Array<{
    campaignId: string;
    currentBid: number;
    newBid: number;
    reason: string;
  }>;
  pauseCampaigns: string[];
  newAdCopy: AdCopy[];
  audienceAdjustments: Array<{
    campaignId: string;
    action: string;
    details: string;
  }>;
}

export interface AdCopy {
  platform: 'google' | 'meta';
  headlines: string[];
  descriptions: string[];
  primaryText?: string;
  cta?: string;
}

export interface PlatformPerformance {
  google: {
    spend: number;
    conversions: number;
  };
  meta: {
    spend: number;
    conversions: number;
  };
}

export interface BudgetAllocation {
  google: number;
  meta: number;
}
