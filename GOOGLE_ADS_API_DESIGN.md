# Google Ads API - Design Documentation
## ASAP Jet Marketing AI System

**Application Name**: ASAP Jet Marketing AI
**Company**: ASAP Jet
**Website**: https://asapjet.flights
**Business Type**: Private Air Charter Service
**API Use Case**: Autonomous Campaign Optimization

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Business Overview](#business-overview)
3. [API Integration Purpose](#api-integration-purpose)
4. [Technical Architecture](#technical-architecture)
5. [API Usage Patterns](#api-usage-patterns)
6. [Data Flow](#data-flow)
7. [Security & Compliance](#security--compliance)
8. [Performance & Scalability](#performance--scalability)

---

## Executive Summary

ASAP Jet is building an autonomous Marketing AI system that optimizes Google Search Ads campaigns in real-time. The system uses the Google Ads API to:

- Monitor campaign performance metrics (impressions, clicks, conversions, spend)
- Automatically adjust budgets based on ROI and target cost-per-lead (CPL)
- Pause underperforming campaigns to prevent budget waste
- Generate performance analytics and optimization recommendations
- Track conversion attribution from leads back to specific campaigns

The AI makes data-driven decisions 3 times daily (8 AM, 2 PM, 8 PM EST) to maximize lead quality while maintaining budget discipline.

---

## Business Overview

### Company Background

**ASAP Jet** provides on-demand private air charter services specializing in last-minute and urgent bookings. Our target customers are business executives, urgent travelers, and groups requiring immediate air travel solutions.

### Marketing Goals

- **Primary Objective**: Generate qualified charter quote requests
- **Target Cost Per Lead (CPL)**: $25 or below
- **Monthly Budget**: $500-1,000
- **Daily Budget Cap**: $50
- **Focus**: High-intent search queries indicating immediate need

### Target Keywords (High-Intent)

- "last minute private jet"
- "emergency charter flight"
- "same day private flight"
- "urgent air charter"
- "asap private jet booking"

---

## API Integration Purpose

### Why We Need Google Ads API Access

**Manual management is impractical for our use case because:**

1. **Time-sensitive business**: Charter flights are booked 24/7, requiring constant campaign monitoring
2. **Budget efficiency**: Small budget requires precise optimization to avoid waste
3. **Performance volatility**: High-intent keywords have fluctuating CPCs that need real-time adjustment
4. **Scale limitations**: Manual optimization can't analyze performance across multiple campaigns and ad variations simultaneously

**The API enables us to:**

- **Automate budget allocation** between campaigns based on real-time performance
- **Prevent overspend** by monitoring cumulative daily spend across all campaigns
- **Pause poor performers** automatically when CPL exceeds $30
- **Optimize bids** based on conversion data and quality scores
- **Track ROI** by linking conversions (form submissions) back to specific campaigns and keywords

---

## Technical Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                     ASAP Jet Website                        │
│                   (asapjet.flights)                         │
│                                                             │
│  • Lead Form (Quote Requests)                              │
│  • Conversion Tracking (Google Tag)                        │
│  • ChatGPT/SEO Optimization                                │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ Lead Data
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                 Supabase Database                           │
│                                                             │
│  • leads table (form submissions)                          │
│  • ad_campaigns table (campaign metadata)                  │
│  • ad_performance table (daily metrics)                    │
│  • lead_attribution table (conversion tracking)            │
│  • ai_optimization_log table (decision history)            │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ Performance Data
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              Marketing AI Agent                             │
│           (Claude Sonnet 4.5 via Anthropic API)            │
│                                                             │
│  • Analyzes campaign performance                           │
│  • Calculates ROI and cost metrics                         │
│  • Generates optimization recommendations                  │
│  • Creates new ad copy variations                          │
│  • Determines budget adjustments                           │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ Optimization Actions
                       ▼
┌─────────────────────────────────────────────────────────────┐
│               Google Ads API Integration                    │
│                                                             │
│  READ:                                                      │
│  • Campaign performance metrics                            │
│  • Ad group statistics                                     │
│  • Keyword performance data                                │
│  • Quality scores                                          │
│  • Conversion tracking data                                │
│                                                             │
│  WRITE:                                                     │
│  • Update campaign budgets                                 │
│  • Pause/enable campaigns                                  │
│  • Adjust bid strategies                                   │
│  • Create new ads (pending approval)                       │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

- **Platform**: Vercel (Next.js 15 serverless functions)
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **AI Engine**: Anthropic Claude Sonnet 4.5
- **Scheduling**: Vercel Cron Jobs (3x daily)
- **Authentication**: OAuth 2.0 (Google Ads API)

---

## API Usage Patterns

### 1. Scheduled Optimization Runs (Primary Use Case)

**Frequency**: 3 times daily (8 AM, 2 PM, 8 PM EST)
**Trigger**: Vercel Cron Job
**Duration**: ~30-60 seconds per run

#### API Endpoints Called:

**READ Operations:**
```
1. GoogleAdsService.SearchStream
   - Query: Campaign performance for last 7 days
   - Metrics: impressions, clicks, conversions, cost
   - Purpose: Analyze ROI and identify optimization opportunities

2. AdGroupService.List
   - Query: All active ad groups
   - Metrics: CTR, quality_score, avg_cpc
   - Purpose: Identify underperformers

3. KeywordService.List
   - Query: Keyword-level performance
   - Metrics: impressions, clicks, conversions, cost_per_conversion
   - Purpose: Keyword optimization recommendations

4. CampaignService.Get
   - Query: Current budget and status
   - Purpose: Ensure budget changes don't exceed limits
```

**WRITE Operations (Conditional):**
```
5. CampaignService.MutateCampaigns
   - Action: Update daily_budget
   - Frequency: Only if ROI justifies change
   - Safety: Max 20% adjustment per run, never exceed $50/day total

6. CampaignService.MutateCampaigns
   - Action: Set status to PAUSED
   - Condition: CPL > $30 for 3+ consecutive days
   - Purpose: Stop budget waste on poor performers

7. AdService.MutateAds
   - Action: Create new ad variations
   - Status: PAUSED (requires manual approval)
   - Frequency: ~3 new ads per week for testing
```

### 2. Real-time Conversion Tracking

**Frequency**: Every time a lead form is submitted
**Trigger**: User submits quote request
**Duration**: <1 second

#### API Endpoints Called:

```
1. ConversionUploadService.UploadClickConversions
   - Data: gclid (Google Click ID), conversion_time, conversion_value
   - Purpose: Track which campaigns/keywords drive actual leads
   - Frequency: Per form submission (estimated 5-20/day at scale)
```

### 3. Weekly Performance Reporting

**Frequency**: Weekly (Monday mornings)
**Trigger**: Vercel Cron Job
**Duration**: ~2-3 minutes

#### API Endpoints Called:

```
1. GoogleAdsService.SearchStream
   - Query: Full week performance breakdown
   - Metrics: All KPIs by campaign, ad group, keyword
   - Purpose: Comprehensive performance report
   - Export: CSV/JSON for analysis
```

---

## Data Flow

### Campaign Performance Analysis Flow

```
1. Cron Trigger (8 AM, 2 PM, 8 PM EST)
   ↓
2. Fetch Campaign Data (Google Ads API)
   - Last 7 days performance
   - Current budget and status
   - Quality scores
   ↓
3. Store Raw Data (Supabase)
   - ad_performance table
   - Indexed by campaign_id + date
   ↓
4. Calculate Metrics (Server Logic)
   - CTR = clicks / impressions
   - CPC = cost / clicks
   - Conversion Rate = conversions / clicks
   - Cost Per Lead = cost / conversions
   ↓
5. AI Analysis (Anthropic API)
   - Input: Campaign performance JSON
   - Output: Optimization plan (budget changes, pause recommendations)
   ↓
6. Apply Changes (Google Ads API)
   - Update budgets (if CPL < target)
   - Pause campaigns (if CPL > $30)
   ↓
7. Log Decision (Supabase)
   - ai_optimization_log table
   - Reason, action, result for audit trail
```

### Conversion Attribution Flow

```
1. User Clicks Google Ad
   ↓
2. Landing Page Load
   - gclid captured from URL parameter
   - Stored in browser session
   ↓
3. User Submits Lead Form
   ↓
4. Create Lead Record (Supabase)
   - leads table: user details + timestamp
   ↓
5. Create Attribution Record (Supabase)
   - lead_attribution table: lead_id + gclid + utm params
   ↓
6. Upload Conversion (Google Ads API)
   - ConversionUploadService with gclid
   - Conversion value: $25 (target CPL)
   ↓
7. Google Ads Updates Campaign Stats
   - Conversion counted toward campaign
   - Smart Bidding uses data for optimization
```

---

## Security & Compliance

### Authentication

- **Method**: OAuth 2.0 with refresh tokens
- **Scope**: `https://www.googleapis.com/auth/adwords` (full access required for budget changes)
- **Token Storage**: Encrypted in Vercel environment variables
- **Token Rotation**: Automatic via refresh token mechanism

### API Credentials Security

```
Environment Variables (Encrypted at Rest):
- GOOGLE_ADS_CLIENT_ID
- GOOGLE_ADS_CLIENT_SECRET
- GOOGLE_ADS_DEVELOPER_TOKEN
- GOOGLE_ADS_REFRESH_TOKEN
- GOOGLE_ADS_CUSTOMER_ID
```

### Access Control

- **Cron Jobs**: Protected by `CRON_SECRET` bearer token
- **Admin Dashboard**: Password-protected (`/admin` route)
- **Database**: Row-Level Security (RLS) enabled on all tables
- **API Rate Limiting**: Implemented to prevent quota exhaustion

### Data Protection

- **PII Handling**: Lead data (name, email, phone) stored securely in Supabase
- **GDPR Compliance**: Data retention policies enforced (leads archived after 90 days)
- **Audit Trail**: All AI decisions logged with timestamp, reason, and result

### Budget Safeguards

```typescript
Safety Limits:
- Daily budget cap: $50 (hard limit, never exceeded)
- Max single campaign budget: $25/day
- Max budget increase: 20% per optimization run
- Pause trigger: CPL > $30 for 3 consecutive days
- Minimum data threshold: 30+ clicks before major changes
```

---

## Performance & Scalability

### API Call Volume Estimates

**Current Scale (Month 1-3):**
- Campaigns: 2-3 active campaigns
- Ad Groups: 5-10 ad groups
- Keywords: 20-30 keywords
- Daily API calls: ~50-100
- Monthly API calls: ~1,500-3,000

**Projected Scale (Month 6-12):**
- Campaigns: 5-8 active campaigns
- Ad Groups: 15-25 ad groups
- Keywords: 50-80 keywords
- Daily API calls: ~150-250
- Monthly API calls: ~4,500-7,500

### Quota Management

- **Google Ads API Quotas**: Well within standard limits (millions of operations/day)
- **Rate Limiting**: Implemented exponential backoff for retries
- **Caching**: Performance data cached for 1 hour to reduce redundant calls
- **Batch Requests**: Multiple campaigns queried in single SearchStream call

### Error Handling

```typescript
Error Recovery Strategy:
1. Transient Errors (network timeout):
   - Retry with exponential backoff (3 attempts)

2. Authentication Errors:
   - Automatic token refresh
   - Alert admin if refresh fails

3. Quota Exceeded:
   - Queue operations for next run
   - Log incident for review

4. Invalid Data:
   - Validate before API call
   - Rollback database changes on failure
   - Alert admin with error details
```

### Monitoring & Alerting

- **Success Rate**: Track API call success/failure rates
- **Latency**: Monitor optimization run duration
- **Budget Tracking**: Alert if daily spend approaches $50
- **Error Alerts**: Email notification on critical failures
- **Performance Dashboard**: Real-time view of campaigns and AI decisions

---

## Use Case Summary

### Primary API Functions

1. **Campaign Performance Monitoring** (Read)
   - Retrieve metrics to calculate ROI
   - Identify optimization opportunities
   - Track quality scores and CTR

2. **Budget Optimization** (Write)
   - Reallocate budget to high-performing campaigns
   - Pause underperformers to prevent waste
   - Ensure total spend stays under $50/day

3. **Conversion Tracking** (Write)
   - Upload lead conversions with gclid
   - Enable Smart Bidding optimization
   - Measure true ROI (leads, not just clicks)

4. **Performance Reporting** (Read)
   - Generate weekly performance summaries
   - Analyze trends over time
   - Provide transparency to business owner

### Benefits of API Integration

- **24/7 Optimization**: Campaigns optimized even outside business hours
- **Faster Response**: Budget adjusted within hours, not days
- **Data-Driven**: AI makes objective decisions based on metrics
- **Cost Efficiency**: Prevents waste on poor performers
- **Scalability**: Can manage many campaigns without additional human effort
- **Transparency**: All decisions logged with reasoning for audit

---

## Compliance & Responsible Use

We commit to:

- **No spam or deceptive practices**: Only high-quality, relevant ads
- **Respect user privacy**: GDPR/CCPA compliant data handling
- **Transparent billing**: Clear conversion tracking and ROI metrics
- **API quota respect**: Efficient batching and caching to minimize calls
- **Security first**: OAuth 2.0, encrypted credentials, audit logging
- **Human oversight**: AI recommendations reviewed weekly, critical changes require approval

---

## Contact Information

**Developer**: Jesse (Business Owner)
**Email**: Available upon request
**Website**: https://asapjet.flights
**GitHub Repository**: Private (available for review if requested)

---

**Document Version**: 1.0
**Last Updated**: December 23, 2024
**Purpose**: Google Ads API Developer Token Application
