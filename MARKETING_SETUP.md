# ASAP Jet Marketing AI Setup Guide

This guide will help you set up Google Search Ads and optimize for ChatGPT/SearchGPT citations using autonomous Marketing AI.

## Overview

Your Marketing AI will:
- ✅ Automatically optimize Google Search ad budgets daily
- ✅ Generate and test new ad copy variations
- ✅ Pause underperforming campaigns
- ✅ Adjust bids based on performance
- ✅ Track ROI and cost per lead
- ✅ Optimize content for ChatGPT/SearchGPT citations
- ✅ Provide daily performance reports

**Budget**: $500-1000/month
**Goal**: Immediate quote requests from high-intent searches
**Automation**: Full autopilot
**Platforms**: Google Search Ads + ChatGPT/SearchGPT optimization

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

## Step 2: ChatGPT/SearchGPT Optimization

### 2.1 Understanding AI Search Engines

ChatGPT and SearchGPT (OpenAI's search engine) are becoming major traffic sources. Unlike traditional SEO, AI citations require:

- **Authoritative, factual content** that AI can confidently cite
- **Structured data** that helps AI understand your services
- **Direct answers** to common questions
- **Trust signals** like testimonials and case studies

### 2.2 Content Strategy for AI Citations

The Marketing AI will automatically generate recommendations for:

1. **FAQ Content** - Common questions like "How quickly can I book a private jet?"
2. **Case Studies** - Real examples of last-minute charter flights
3. **Technical Details** - Aircraft types, range, capacity
4. **Structured Data** - Schema markup for flights and services

### 2.3 Tracking AI Referrals

Monitor traffic from:
- `chat.openai.com` (ChatGPT web)
- `searchgpt.com` (SearchGPT)
- `perplexity.ai` (Perplexity AI)

These will be tracked in the `chatgpt_citations` table.

---

## Step 3: Install Marketing AI Dependencies

Run these commands in your project directory:

```bash
npm install @anthropic-ai/sdk
npm install googleapis
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

# Marketing AI Settings
MARKETING_DAILY_BUDGET=50
MARKETING_TOTAL_BUDGET=1000
MARKETING_TARGET_CPL=25
MARKETING_AI_ENABLED=true

# Cron Secret (generate a random string)
CRON_SECRET=your_random_secret_here
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
- ChatGPT citation tracking

---

## Step 6: Create Initial Google Search Campaigns

### High-Intent Search Campaign

**Campaign Name**: ASAP Jet - Last Minute Charters

**Campaign Type**: Search

**Keywords** (Exact Match - High Intent):
- `[last minute private jet]`
- `[charter flight asap]`
- `[emergency air charter]`
- `[same day private flight]`
- `[urgent private jet booking]`
- `[immediate charter flight]`

**Negative Keywords**:
- `cheap`
- `commercial`
- `student`
- `training`
- `pilot school`
- `jobs`
- `careers`

**Initial Budget**: $25/day

**Ad Copy Example**:
```
Headline 1: Last Minute Private Jets
Headline 2: Book Same-Day Flights ASAP
Headline 3: 24/7 Charter Service

Description 1: Urgent private jet charters available now. Get instant quotes.
Description 2: Professional crew, luxury aircraft. Fly today.
```

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

Add this to your environment variables:
```bash
GOOGLE_ADS_CONVERSION_ID=AW-XXXXXXXXX
GOOGLE_ADS_CONVERSION_LABEL=XXXXXXXXXXXX
```

The Marketing AI will automatically track conversions.

---

## Step 8: Optimize for ChatGPT Citations

### 8.1 Add Structured Data

Add this to your homepage to help AI understand your service:

```json
{
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "ASAP Jet Private Air Charter",
  "description": "Last-minute private jet charter service with same-day availability",
  "provider": {
    "@type": "Organization",
    "name": "ASAP Jet",
    "url": "https://asapjet.flights"
  },
  "areaServed": "United States",
  "availableChannel": {
    "@type": "ServiceChannel",
    "serviceUrl": "https://asapjet.flights",
    "availableLanguage": "English"
  }
}
```

### 8.2 Create FAQ Page

Add a FAQ page with questions ChatGPT users commonly ask:

**Q: How quickly can I book a private jet?**
A: ASAP Jet can arrange charter flights with as little as 2-4 hours notice, depending on aircraft availability and your departure location.

**Q: What is the cost of a last-minute private jet?**
A: Last-minute charter costs vary by route and aircraft type. Request an instant quote at asapjet.flights for accurate pricing.

**Q: Can I book a private jet for same-day travel?**
A: Yes, ASAP Jet specializes in same-day and last-minute private jet bookings. Contact us 24/7 for immediate availability.

---

## Daily Automated Actions

Your Marketing AI will:

### Every Morning (8 AM):
- Analyze previous day's performance
- Adjust budgets based on ROI
- Review ChatGPT citation traffic
- Generate performance summary

### Every Afternoon (2 PM):
- Check mid-day performance
- Pause severely underperforming ads
- Adjust bids if needed
- Monitor high-intent keyword performance

### Every Evening (8 PM):
- Review daily spend vs budget
- Generate new ad copy variations for tomorrow
- Plan next day's budget allocation
- Update ChatGPT optimization recommendations

---

## Monitoring Dashboard

Access your marketing dashboard at:
`https://asapjet.flights/admin/marketing`

You'll see:
- Real-time spend and conversions
- Cost per lead from Google Search
- Active campaigns and their performance
- AI's recent decisions and reasoning
- Lead attribution (which campaign drove which lead)
- ChatGPT/SearchGPT referral traffic

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

## High-Intent Keywords Strategy

Focus on search queries indicating **immediate need**:

### Primary Keywords (Exact Match):
- `[last minute private jet]`
- `[emergency charter flight]`
- `[same day private flight]`
- `[urgent air charter]`
- `[asap private jet]`

### Secondary Keywords (Phrase Match):
- "book private jet today"
- "immediate charter flight"
- "private jet now"
- "emergency air travel"

### Avoid Broad Match - stick to exact and phrase match for high intent.

---

## ChatGPT Optimization Weekly Tasks

The AI will generate recommendations, but you should manually:

1. **Add Case Studies** - Real examples of successful last-minute charters
2. **Update Testimonials** - Recent customer reviews
3. **Create Guides** - "How to Book a Last-Minute Charter Flight"
4. **Monitor AI Referrals** - Check which AI search engines are sending traffic

---

## Performance Benchmarks

**Week 1**: AI is learning, expect testing and optimization
- CPL: $30-40 (above target as AI gathers data)
- CTR: 3-5%
- Conversion Rate: 3-4%

**Week 2-3**: Optimization kicks in
- CPL: $25-30 (approaching target)
- CTR: 5-7%
- Conversion Rate: 4-6%

**Week 4+**: Steady-state performance
- CPL: $20-25 (at or below target)
- CTR: 7-10%
- Conversion Rate: 5-8%

---

## Next Steps

After setup is complete:
1. ✅ Run the database migration
2. ✅ Add environment variables to Vercel
3. ✅ Create initial campaigns in Google Ads
4. ✅ Install conversion tracking
5. ✅ Add structured data to website
6. ✅ Create FAQ page for AI citations
7. ✅ Test with small budget ($20/day) for 3 days
8. ✅ Scale up to full budget once tracking is verified

The Marketing AI will handle the rest autonomously!

---

## Support

Questions? Check the AI optimization log to see its reasoning for any decision:
- Navigate to `/admin/marketing`
- View "Optimization Log" tab
- See detailed explanations for all budget, bid, and ad copy changes
