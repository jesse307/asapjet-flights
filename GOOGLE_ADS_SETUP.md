# Google Ads API Setup Guide

## Your Credentials

| Credential | Value |
|------------|-------|
| Developer Token | `C2HNU5cNB-i6hAi6_3vBfA` |
| Manager Account ID | `8002140933` |

## Step 1: Create OAuth Credentials in Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select or create a project
3. Enable the **Google Ads API**:
   - Go to **APIs & Services** → **Library**
   - Search for "Google Ads API"
   - Click **Enable**

4. Create OAuth credentials:
   - Go to **APIs & Services** → **Credentials**
   - Click **Create Credentials** → **OAuth client ID**
   - Application type: **Web application**
   - Name: `ASAP Jet Marketing AI`
   - Authorized redirect URIs:
     - `https://asapjet.flights/api/auth/google-ads/callback`
     - `http://localhost:3000/api/auth/google-ads/callback` (for local testing)
   - Click **Create**
   - Copy the **Client ID** and **Client Secret**

## Step 2: Get Your Google Ads Customer ID

Your Manager Account is `8002140933`, but you need the actual **advertising account ID** under it:

1. Go to [Google Ads](https://ads.google.com/)
2. Sign in with your Manager account
3. Select the specific ad account you want to manage
4. The Customer ID is in the top right (format: XXX-XXX-XXXX)

## Step 3: Generate Refresh Token

1. Add these environment variables to Vercel first:
   - `GOOGLE_ADS_CLIENT_ID` = (from Step 1)
   - `GOOGLE_ADS_CLIENT_SECRET` = (from Step 1)

2. Deploy your app to Vercel

3. Visit: `https://asapjet.flights/api/auth/google-ads`

4. Sign in with your Google account that has access to Google Ads

5. Authorize the app

6. You'll be redirected to a page showing your **Refresh Token**

7. Copy the refresh token and add it to Vercel

## Step 4: Add All Environment Variables to Vercel

Go to your Vercel project → **Settings** → **Environment Variables**

Add these variables:

```
GOOGLE_ADS_DEVELOPER_TOKEN=C2HNU5cNB-i6hAi6_3vBfA
GOOGLE_ADS_MANAGER_ID=8002140933
GOOGLE_ADS_CUSTOMER_ID=<your-ad-account-id>
GOOGLE_ADS_CLIENT_ID=<from-google-cloud-console>
GOOGLE_ADS_CLIENT_SECRET=<from-google-cloud-console>
GOOGLE_ADS_REFRESH_TOKEN=<from-oauth-flow>
GOOGLE_ADS_CONVERSION_ACTION_ID=<optional-for-conversion-tracking>
```

## Step 5: Test the Integration

Visit: `https://asapjet.flights/api/marketing/optimize`

You should see a JSON response with:
- Campaign performance data
- AI analysis
- Any optimization actions taken

## Cron Schedule

The Marketing AI runs automatically 3 times daily:

| Time (EST) | Time (UTC) | Purpose |
|------------|------------|---------|
| 8:00 AM | 1:00 PM | Morning optimization |
| 2:00 PM | 7:00 PM | Afternoon check |
| 8:00 PM | 1:00 AM | Evening review |

## What the AI Does

1. **Fetches** campaign performance from Google Ads (last 7 days)
2. **Analyzes** with Claude AI to find optimization opportunities
3. **Applies** budget changes (max 20% per run)
4. **Pauses** underperformers (CPL > $30 with 30+ clicks)
5. **Logs** all decisions to Supabase for audit trail

## Safety Limits

- Daily budget cap: **$50** (never exceeded)
- Max budget increase per run: **20%**
- Pause threshold: CPL > **$30** for campaigns with **30+ clicks**
- All changes are logged with reasoning

## Troubleshooting

### "Google Ads API not configured"
Missing environment variables. Check all 6 are set in Vercel.

### "Failed to refresh access token"
The refresh token may have expired. Re-run the OAuth flow (Step 3).

### "Campaign not found"
The Customer ID might be wrong. Make sure you're using the ad account ID, not the manager account ID.

### No campaigns showing
Make sure you have active campaigns in Google Ads and the Customer ID is correct.

## Files Created

| File | Purpose |
|------|---------|
| `lib/google-ads.ts` | Google Ads API client |
| `app/api/auth/google-ads/route.ts` | OAuth flow start |
| `app/api/auth/google-ads/callback/route.ts` | OAuth callback |
| `app/api/marketing/optimize/route.ts` | Main optimization endpoint |
| `vercel.json` | Cron schedule (3x daily) |
