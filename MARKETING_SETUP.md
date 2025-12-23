# ASAP Jet Marketing AI Setup Guide

This guide will help you set up Google Ads and Meta (Facebook/Instagram) advertising accounts, then connect them to your autonomous Marketing AI.

## Overview

Your Marketing AI will:
- ✅ Automatically optimize ad budgets daily
- ✅ Generate and test new ad copy variations
- ✅ Pause underperforming campaigns
- ✅ Adjust bids based on performance
- ✅ Track ROI and cost per lead
- ✅ Provide daily performance reports

**Budget**: $500-1000/month
**Goal**: Immediate quote requests
**Automation**: Full autopilot

---

## Step 1: Google Ads Setup

### 1.1 Create Google Ads Account

1. Go to [ads.google.com](https://ads.google.com)
2. Click "Start Now"
3. Sign in with your Google account (or create one)
4. Choose "Switch to Expert Mode" (skip the guided setup)
5. Click "Create an account without a campaign"

### 1.2 Set Up Billing

1. Click the tools icon ⚙️ → "Billing" → "Settings"
2. Add your payment method (credit card recommended for fastest setup)
3. Set your billing country to United States
4. Confirm your business information

### 1.3 Enable Google Ads API

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a new project (name it "ASAP Jet Marketing")
3. Enable the "Google Ads API"
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Choose "Web application"
6. Add authorized redirect URI: `https://asapjet.flights/api/auth/google/callback`
7. Save the Client ID and Client Secret

### 1.4 Get Your Customer ID

1. In Google Ads, click your profile icon (top right)
2. Your Customer ID is shown (format: 123-456-7890)
3. Copy this - you'll need it

---

## Step 2: Meta (Facebook/Instagram) Ads Setup

### 2.1 Create Meta Business Account

1. Go to [business.facebook.com](https://business.facebook.com)
2. Click "Create Account"
3. Enter your business name: "ASAP Jet"
4. Confirm your name and business email
5. Complete verification (may require business documents)

### 2.2 Create Ad Account

1. In Business Settings, go to "Accounts" → "Ad Accounts"
2. Click "Add" → "Create a new ad account"
3. Name it "ASAP Jet - Main"
4. Choose USD as currency
5. Set time zone to your location
6. Add payment method

### 2.3 Connect Facebook Page & Instagram

1. In Business Settings → "Pages"
2. Click "Add" → Connect your Facebook page (or create one)
3. Go to "Instagram Accounts"
4. Click "Add" → Connect your Instagram business account

### 2.4 Get Access Token

1. Go to [developers.facebook.com](https://developers.facebook.com)
2. Click "My Apps" → "Create App"
3. Choose "Business" type
4. Name it "ASAP Jet Marketing AI"
5. Go to "Tools" → "Graph API Explorer"
6. Select your app
7. Get Token → Select these permissions:
   - `ads_read`
   - `ads_management`
   - `pages_read_engagement`
   - `pages_manage_ads`
8. Generate token and save it (this is your access token)
9. Get your Ad Account ID from Business Settings

---

## Step 3: Install Marketing AI Dependencies

Run these commands in your project directory:

```bash
npm install @anthropic-ai/sdk
npm install googleapis
npm install facebook-nodejs-business-sdk
```

---

## Step 4: Configure Environment Variables

Add these to your Vercel environment variables:

```bash
# Anthropic API (for AI decision-making)
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Google Ads
GOOGLE_ADS_CLIENT_ID=your_client_id_here
GOOGLE_ADS_CLIENT_SECRET=your_client_secret_here
GOOGLE_ADS_DEVELOPER_TOKEN=your_developer_token_here
GOOGLE_ADS_CUSTOMER_ID=123-456-7890
GOOGLE_ADS_REFRESH_TOKEN=your_refresh_token_here

# Meta Ads
META_ACCESS_TOKEN=your_meta_access_token_here
META_AD_ACCOUNT_ID=act_1234567890
META_APP_ID=your_app_id_here
META_APP_SECRET=your_app_secret_here

# Marketing AI Settings
MARKETING_DAILY_BUDGET=50
MARKETING_TOTAL_BUDGET=1000
MARKETING_TARGET_CPL=25
```

---

## Step 5: Run Database Migration

In your Supabase SQL Editor, run:

```sql
-- Copy and paste the contents of supabase-marketing-schema.sql
```

This creates the tables for:
- Ad campaign tracking
- Performance metrics
- AI optimization logs
- Lead attribution

---

## Step 6: Create Initial Campaigns

Your Marketing AI will create and manage campaigns, but you need to approve the first set.

### Google Search Campaign Template

**Campaign Name**: ASAP Jet - Last Minute Charters
**Type**: Search
**Keywords** (Exact Match):
- `[last minute private jet]`
- `[charter flight asap]`
- `[emergency air charter]`
- `[same day private flight]`

**Negative Keywords**:
- `cheap`
- `commercial`
- `student`
- `training`

### Meta Campaign Template

**Campaign Name**: ASAP Jet - Luxury Travel
**Objective**: Conversions (Lead)
**Targeting**:
- Age: 35-65
- Income: Top 10%
- Interests: Business travel, luxury travel, private aviation
- Behaviors: Frequent travelers, business decision-makers

**Placement**: Feed + Stories (both Facebook & Instagram)

---

## Step 7: Set Up Conversion Tracking

### Google Ads Conversion Tracking

1. In Google Ads → "Tools" → "Conversions"
2. Click "+" → "Website"
3. Category: "Submit lead form"
4. Name: "Quote Request"
5. Value: $25 (your target CPL)
6. Count: One
7. Click-through window: 30 days
8. Get the conversion tracking tag

I'll automatically add this to your website.

### Meta Pixel

1. In Business Settings → "Data Sources" → "Pixels"
2. Click "Add" → "Create a Pixel"
3. Name it "ASAP Jet Pixel"
4. Copy the Pixel ID

I'll add the Meta Pixel to track conversions.

---

## Step 8: Test & Launch

1. Verify conversion tracking works (submit a test form)
2. Check that campaigns are active
3. Monitor first 24 hours closely
4. Marketing AI will take over after initial data collection

---

## Daily Automated Actions

Your Marketing AI will:

### Every Morning (8 AM):
- Analyze previous day's performance
- Adjust budgets based on ROI
- Generate performance summary email

### Every Afternoon (2 PM):
- Check mid-day performance
- Pause severely underperforming ads
- Adjust bids if needed

### Every Evening (8 PM):
- Review daily spend vs budget
- Generate new ad copy variations for tomorrow
- Plan next day's budget allocation

---

## Monitoring Dashboard

Access your marketing dashboard at:
`https://asapjet.flights/admin/marketing`

You'll see:
- Real-time spend and conversions
- Cost per lead by platform
- Active campaigns and their performance
- AI's recent decisions and reasoning
- Lead attribution (which campaign drove which lead)

---

## Safety Guardrails

The AI has built-in limits:
- ✅ Never exceed daily budget of $50
- ✅ Pause any campaign over $30 CPL
- ✅ Require 30+ clicks before major changes
- ✅ Max 20% bid adjustments at once
- ✅ Log all decisions for review

---

## Emergency Controls

If you need to stop everything:
1. Go to `/admin/marketing`
2. Click "Pause All Campaigns"
3. Or set `MARKETING_AI_ENABLED=false` in environment variables

---

## Support & Optimization

**First Week**: AI is learning, expect some testing
**Week 2-3**: Optimization kicks in, CPL should drop
**Week 4+**: Steady-state performance, consistent leads

Questions? Check the AI optimization log to see its reasoning for any decision.

---

## Next Steps

After setup is complete:
1. ✅ Run the database migration
2. ✅ Add environment variables to Vercel
3. ✅ Create initial campaigns in Google & Meta
4. ✅ Install conversion tracking pixels
5. ✅ Test with small budget ($20/day) for 3 days
6. ✅ Scale up to full budget once tracking is verified

The Marketing AI will handle the rest autonomously!
