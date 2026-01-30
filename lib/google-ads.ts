/**
 * Google Ads API Client for ASAP Jet Marketing AI
 *
 * Handles all interactions with the Google Ads API:
 * - Fetching campaign performance data
 * - Updating budgets
 * - Pausing/enabling campaigns
 * - Uploading conversions
 */

// Google Ads API configuration
const GOOGLE_ADS_CONFIG = {
  developerToken: process.env.GOOGLE_ADS_DEVELOPER_TOKEN!,
  clientId: process.env.GOOGLE_ADS_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_ADS_CLIENT_SECRET!,
  refreshToken: process.env.GOOGLE_ADS_REFRESH_TOKEN!,
  managerCustomerId: process.env.GOOGLE_ADS_MANAGER_ID || '8002140933',
  customerId: process.env.GOOGLE_ADS_CUSTOMER_ID!, // The actual ad account under the MCC
};

// API endpoints
const GOOGLE_ADS_API_VERSION = 'v18';
const GOOGLE_ADS_BASE_URL = `https://googleads.googleapis.com/${GOOGLE_ADS_API_VERSION}`;

/**
 * Get a fresh access token using the refresh token
 */
async function getAccessToken(): Promise<string> {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: GOOGLE_ADS_CONFIG.clientId,
      client_secret: GOOGLE_ADS_CONFIG.clientSecret,
      refresh_token: GOOGLE_ADS_CONFIG.refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to refresh access token: ${error}`);
  }

  const data = await response.json();
  return data.access_token;
}

/**
 * Make an authenticated request to the Google Ads API
 */
async function googleAdsRequest(
  endpoint: string,
  method: 'GET' | 'POST' = 'POST',
  body?: object
): Promise<any> {
  const accessToken = await getAccessToken();
  const customerId = GOOGLE_ADS_CONFIG.customerId.replace(/-/g, '');

  const response = await fetch(`${GOOGLE_ADS_BASE_URL}/${endpoint}`, {
    method,
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'developer-token': GOOGLE_ADS_CONFIG.developerToken,
      'login-customer-id': GOOGLE_ADS_CONFIG.managerCustomerId.replace(/-/g, ''),
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Google Ads API error: ${response.status} - ${error}`);
  }

  return response.json();
}

/**
 * Execute a GAQL (Google Ads Query Language) query
 * Uses the REST search endpoint (not searchStream which is for gRPC)
 */
async function executeQuery(query: string): Promise<any[]> {
  const customerId = GOOGLE_ADS_CONFIG.customerId.replace(/-/g, '');

  const result = await googleAdsRequest(
    `customers/${customerId}/googleAds:search`,
    'POST',
    { query }
  );

  // REST search endpoint returns results directly in a results array
  return result.results || [];
}

// ============================================
// CAMPAIGN PERFORMANCE DATA
// ============================================

export interface CampaignMetrics {
  campaignId: string;
  campaignName: string;
  status: string;
  impressions: number;
  clicks: number;
  conversions: number;
  costMicros: number;
  cost: number;
  ctr: number;
  cpc: number;
  conversionRate: number;
  costPerConversion: number;
}

/**
 * Fetch campaign performance data for the last N days
 */
export async function getCampaignPerformance(days: number = 7): Promise<CampaignMetrics[]> {
  const query = `
    SELECT
      campaign.id,
      campaign.name,
      campaign.status,
      metrics.impressions,
      metrics.clicks,
      metrics.conversions,
      metrics.cost_micros
    FROM campaign
    WHERE segments.date DURING LAST_${days}_DAYS
      AND campaign.status != 'REMOVED'
  `;

  const results = await executeQuery(query);

  return results.map(row => {
    const impressions = parseInt(row.metrics?.impressions || '0');
    const clicks = parseInt(row.metrics?.clicks || '0');
    const conversions = parseFloat(row.metrics?.conversions || '0');
    const costMicros = parseInt(row.metrics?.costMicros || '0');
    const cost = costMicros / 1_000_000;

    return {
      campaignId: row.campaign.id,
      campaignName: row.campaign.name,
      status: row.campaign.status,
      impressions,
      clicks,
      conversions,
      costMicros,
      cost,
      ctr: impressions > 0 ? (clicks / impressions) * 100 : 0,
      cpc: clicks > 0 ? cost / clicks : 0,
      conversionRate: clicks > 0 ? (conversions / clicks) * 100 : 0,
      costPerConversion: conversions > 0 ? cost / conversions : 0,
    };
  });
}

/**
 * Fetch today's spend across all campaigns
 */
export async function getTodaySpend(): Promise<number> {
  const query = `
    SELECT
      metrics.cost_micros
    FROM campaign
    WHERE segments.date = TODAY
      AND campaign.status = 'ENABLED'
  `;

  const results = await executeQuery(query);

  const totalMicros = results.reduce((sum, row) => {
    return sum + parseInt(row.metrics?.costMicros || '0');
  }, 0);

  return totalMicros / 1_000_000;
}

/**
 * Fetch keyword performance data
 */
export async function getKeywordPerformance(days: number = 7): Promise<any[]> {
  const query = `
    SELECT
      ad_group_criterion.keyword.text,
      ad_group_criterion.keyword.match_type,
      campaign.name,
      ad_group.name,
      metrics.impressions,
      metrics.clicks,
      metrics.conversions,
      metrics.cost_micros,
      ad_group_criterion.quality_info.quality_score
    FROM keyword_view
    WHERE segments.date DURING LAST_${days}_DAYS
      AND campaign.status = 'ENABLED'
    ORDER BY metrics.cost_micros DESC
    LIMIT 50
  `;

  return executeQuery(query);
}

// ============================================
// CAMPAIGN MODIFICATIONS
// ============================================

/**
 * Update a campaign's daily budget
 */
export async function updateCampaignBudget(
  campaignId: string,
  newBudgetDollars: number
): Promise<void> {
  const customerId = GOOGLE_ADS_CONFIG.customerId.replace(/-/g, '');

  // First, get the campaign's budget resource name
  const query = `
    SELECT campaign.campaign_budget
    FROM campaign
    WHERE campaign.id = ${campaignId}
  `;

  const results = await executeQuery(query);
  if (results.length === 0) {
    throw new Error(`Campaign ${campaignId} not found`);
  }

  const budgetResourceName = results[0].campaign.campaignBudget;
  const newBudgetMicros = Math.round(newBudgetDollars * 1_000_000);

  // Update the budget
  await googleAdsRequest(
    `customers/${customerId}/campaignBudgets:mutate`,
    'POST',
    {
      operations: [{
        update: {
          resourceName: budgetResourceName,
          amountMicros: newBudgetMicros.toString(),
        },
        updateMask: 'amount_micros',
      }],
    }
  );
}

/**
 * Pause a campaign
 */
export async function pauseCampaign(campaignId: string): Promise<void> {
  const customerId = GOOGLE_ADS_CONFIG.customerId.replace(/-/g, '');
  const resourceName = `customers/${customerId}/campaigns/${campaignId}`;

  await googleAdsRequest(
    `customers/${customerId}/campaigns:mutate`,
    'POST',
    {
      operations: [{
        update: {
          resourceName,
          status: 'PAUSED',
        },
        updateMask: 'status',
      }],
    }
  );
}

/**
 * Enable a campaign
 */
export async function enableCampaign(campaignId: string): Promise<void> {
  const customerId = GOOGLE_ADS_CONFIG.customerId.replace(/-/g, '');
  const resourceName = `customers/${customerId}/campaigns/${campaignId}`;

  await googleAdsRequest(
    `customers/${customerId}/campaigns:mutate`,
    'POST',
    {
      operations: [{
        update: {
          resourceName,
          status: 'ENABLED',
        },
        updateMask: 'status',
      }],
    }
  );
}

// ============================================
// CONVERSION TRACKING
// ============================================

/**
 * Upload an offline conversion (when a lead form is submitted)
 */
export async function uploadConversion(
  gclid: string,
  conversionTime: Date,
  conversionValue: number = 25 // Default to target CPL value
): Promise<void> {
  const customerId = GOOGLE_ADS_CONFIG.customerId.replace(/-/g, '');

  // Format time as required by the API (yyyy-MM-dd HH:mm:ss+|-HH:mm)
  const formattedTime = conversionTime.toISOString().replace('T', ' ').replace('Z', '+00:00');

  await googleAdsRequest(
    `customers/${customerId}/conversionUploads:uploadClickConversions`,
    'POST',
    {
      conversions: [{
        gclid,
        conversionAction: `customers/${customerId}/conversionActions/${process.env.GOOGLE_ADS_CONVERSION_ACTION_ID}`,
        conversionDateTime: formattedTime,
        conversionValue,
        currencyCode: 'USD',
      }],
      partialFailure: true,
    }
  );
}

// ============================================
// ACCOUNT INFO
// ============================================

/**
 * Get basic account info to verify connection
 */
export async function getAccountInfo(): Promise<{ customerId: string; name: string }> {
  const customerId = GOOGLE_ADS_CONFIG.customerId.replace(/-/g, '');

  const query = `
    SELECT
      customer.id,
      customer.descriptive_name
    FROM customer
    LIMIT 1
  `;

  const results = await executeQuery(query);

  if (results.length === 0) {
    throw new Error('Could not retrieve account info');
  }

  return {
    customerId: results[0].customer.id,
    name: results[0].customer.descriptiveName,
  };
}

/**
 * Check if the API credentials are configured
 */
export function isConfigured(): boolean {
  return !!(
    GOOGLE_ADS_CONFIG.developerToken &&
    GOOGLE_ADS_CONFIG.clientId &&
    GOOGLE_ADS_CONFIG.clientSecret &&
    GOOGLE_ADS_CONFIG.refreshToken &&
    GOOGLE_ADS_CONFIG.customerId
  );
}

/**
 * Get missing configuration keys
 */
export function getMissingConfig(): string[] {
  const missing: string[] = [];

  if (!process.env.GOOGLE_ADS_DEVELOPER_TOKEN) missing.push('GOOGLE_ADS_DEVELOPER_TOKEN');
  if (!process.env.GOOGLE_ADS_CLIENT_ID) missing.push('GOOGLE_ADS_CLIENT_ID');
  if (!process.env.GOOGLE_ADS_CLIENT_SECRET) missing.push('GOOGLE_ADS_CLIENT_SECRET');
  if (!process.env.GOOGLE_ADS_REFRESH_TOKEN) missing.push('GOOGLE_ADS_REFRESH_TOKEN');
  if (!process.env.GOOGLE_ADS_CUSTOMER_ID) missing.push('GOOGLE_ADS_CUSTOMER_ID');

  return missing;
}
