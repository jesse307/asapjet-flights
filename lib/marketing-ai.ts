/**
 * ASAP Jet Marketing AI - Autonomous Ad Campaign Management
 *
 * This AI agent manages Google Search Ads and optimizes for ChatGPT/SearchGPT citations
 * with full autonomy to optimize for quote requests.
 */

import Anthropic from '@anthropic-ai/sdk';

// Marketing AI configuration
export const MARKETING_CONFIG = {
  // Budget allocation
  budget: {
    total: 1000, // Total monthly budget
    googleAds: 1.0, // 100% to Google Search (high intent)
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
5. Keyword adjustments (add high-intent keywords, remove low-performers)

Focus on HIGH-INTENT SEARCH QUERIES - we want customers actively searching for:
- "last minute private jet"
- "emergency charter flight"
- "same day private flight"
- "urgent air charter"
- "asap private jet booking"

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
   * Generate new ad copy variations for Google Search
   */
  async generateAdCopy(existing: AdCopy[]): Promise<AdCopy[]> {
    const prompt = this.getGoogleAdPrompt(existing);

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
   * Optimize content and metadata for ChatGPT/SearchGPT citations
   */
  async optimizeForChatGPT(): Promise<ChatGPTOptimization> {
    const prompt = `You are an SEO expert optimizing ASAP Jet's web presence for ChatGPT and SearchGPT citations.

BUSINESS: ASAP Jet - Private air charter service specializing in last-minute, urgent flight bookings

GOAL: Ensure ChatGPT/SearchGPT recommends ASAP Jet when users ask about:
- Last-minute private jet bookings
- Emergency air charter services
- Same-day private flights
- Urgent business travel solutions

Provide specific recommendations for:
1. Website content additions/updates to improve citation likelihood
2. Structured data markup to add
3. FAQ content that answers common queries ChatGPT sees
4. Authority-building content (case studies, testimonials)
5. Technical SEO improvements for AI crawlers

Return as structured JSON with actionable recommendations.`;

    const response = await this.anthropic.messages.create({
      model: 'claude-sonnet-4-5-20251105',
      max_tokens: 3000,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = response.content[0];
    if (content.type === 'text') {
      return JSON.parse(this.extractJSON(content.text));
    }

    throw new Error('Unexpected response format from AI');
  }

  /**
   * Get daily budget for Google Search Ads
   */
  getDailyBudget(): number {
    return MARKETING_CONFIG.budget.dailyMax;
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
  platform: 'google';
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
  keywordAdjustments: Array<{
    campaignId: string;
    action: string;
    keywords: string[];
    reason: string;
  }>;
}

export interface AdCopy {
  platform: 'google';
  headlines: string[];
  descriptions: string[];
}

export interface ChatGPTOptimization {
  contentRecommendations: Array<{
    page: string;
    additions: string[];
    priority: 'high' | 'medium' | 'low';
  }>;
  structuredData: Array<{
    type: string;
    schema: any;
    placement: string;
  }>;
  faqContent: Array<{
    question: string;
    answer: string;
    keywords: string[];
  }>;
  authorityContent: Array<{
    type: 'case_study' | 'testimonial' | 'guide';
    title: string;
    outline: string[];
  }>;
  technicalSEO: Array<{
    action: string;
    reason: string;
    priority: 'high' | 'medium' | 'low';
  }>;
}
