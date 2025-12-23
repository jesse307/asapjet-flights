# Google Ads API Access Application
## ASAP Jet Marketing AI System

---

## Application Information

**Applicant Name:** Jesse
**Company Name:** ASAP Jet
**Website:** https://asapjet.flights
**Business Type:** Private Air Charter Service
**Industry:** Aviation / Transportation
**Application Date:** December 23, 2024

---

## Section 1: Business Overview

### 1.1 Company Description

ASAP Jet is a private air charter service specializing in last-minute and urgent flight bookings. We provide on-demand charter flights for business executives, urgent travelers, and groups requiring immediate air travel solutions.

Our unique value proposition is **same-day availability** - customers can book private charter flights with as little as 2-4 hours notice, serving an urgent, high-intent market segment.

### 1.2 Target Market

- **Primary Audience:** Business executives aged 35-65 requiring urgent travel
- **Secondary Audience:** Groups needing emergency air transportation
- **Geographic Focus:** United States (nationwide service)
- **Average Transaction Value:** $8,000-$25,000 per charter

### 1.3 Marketing Goals

- **Primary Objective:** Generate qualified charter quote requests through our website
- **Target Cost Per Lead (CPL):** $25 or below
- **Monthly Advertising Budget:** $500-$1,000
- **Daily Budget Cap:** $50 (strict limit)
- **Expected Lead Volume:** 20-40 qualified leads per month at target CPL

---

## Section 2: Why We Need Google Ads API Access

### 2.1 Business Requirements

Our business model requires **24/7 campaign monitoring and optimization** because:

1. **Time-Sensitive Nature:** Charter flight inquiries occur around the clock, not just during business hours. A campaign burning budget on poor keywords at 2 AM wastes critical marketing dollars.

2. **Small Budget Requires Precision:** With only $50/day to spend, we cannot afford manual optimization delays. A single underperforming campaign left running for 24 hours could waste 40% of our weekly budget.

3. **High-Intent Keywords Are Volatile:** Keywords like "emergency charter flight" and "last minute private jet" have fluctuating CPCs that can spike from $3 to $15+ within hours. Manual monitoring cannot catch these shifts quickly enough.

4. **Conversion Attribution is Critical:** We need real-time conversion tracking to understand which campaigns, ad groups, and keywords drive actual quote requests (not just clicks). This requires programmatic access to upload conversion data.

### 2.2 Manual Management Limitations

Manual campaign management through the Google Ads UI is insufficient because:

- **Response Time:** Manual checks occur 1-2 times per day at best. By the time we identify a problem, significant budget may be wasted.
- **Scale Limitations:** Managing multiple campaigns, ad groups, and keyword variations manually is error-prone and time-consuming.
- **Data Analysis Complexity:** Calculating ROI across campaigns requires exporting data, analyzing in spreadsheets, then logging back in to make changes - too slow for our needs.
- **Overnight Gaps:** No human can monitor campaigns during off-hours, yet our customers book flights 24/7.

### 2.3 API-Enabled Solutions

The Google Ads API enables us to:

1. **Automated Budget Optimization:** Reallocate budget between campaigns based on real-time performance every 8 hours
2. **Automatic Pause Controls:** Immediately pause campaigns when CPL exceeds $30 to prevent budget waste
3. **Real-time Conversion Tracking:** Upload lead form submissions as conversions to enable Smart Bidding optimization
4. **Performance Analytics:** Query campaign data programmatically to generate daily performance reports
5. **Bid Adjustments:** Modify bids based on quality scores and conversion rates without manual intervention

---

## Section 3: Technical Implementation

### 3.1 System Architecture

Our Marketing AI system consists of four components:

**1. Website (asapjet.flights)**
- Next.js web application hosted on Vercel
- Lead capture form for charter quote requests
- Google Ads conversion tracking tag installed
- Captures gclid (Google Click ID) for attribution

**2. Database (Supabase PostgreSQL)**
- Stores lead submissions with timestamps
- Tracks campaign performance metrics daily
- Links conversions back to specific campaigns via gclid
- Maintains audit log of all AI optimization decisions

**3. AI Optimization Engine (Anthropic Claude Sonnet 4.5)**
- Analyzes campaign performance data
- Calculates ROI, CTR, conversion rates, cost per lead
- Generates optimization recommendations
- Creates new ad copy variations for testing

**4. Google Ads API Integration**
- Executes READ operations to fetch performance data
- Executes WRITE operations to implement optimizations
- Uploads conversion events for attribution
- Runs on scheduled cron jobs (3x daily: 8 AM, 2 PM, 8 PM EST)

### 3.2 Programming Language & Framework

- **Language:** TypeScript
- **Runtime:** Node.js 20
- **Framework:** Next.js 15 (serverless functions)
- **Hosting:** Vercel (cloud platform)
- **Database:** PostgreSQL via Supabase
- **Scheduling:** Vercel Cron Jobs

### 3.3 Authentication Method

- **Protocol:** OAuth 2.0
- **Grant Type:** Authorization Code with Refresh Token
- **Scope Required:** `https://www.googleapis.com/auth/adwords`
- **Token Storage:** Encrypted environment variables in Vercel
- **Token Refresh:** Automatic via refresh token mechanism

---

## Section 4: Detailed API Usage

### 4.1 Scheduled Optimization Runs

**Frequency:** 3 times per day (8 AM, 2 PM, 8 PM Eastern Time)
**Trigger:** Vercel Cron Job
**Duration:** Approximately 30-60 seconds per run

#### READ Operations (Data Collection):

**1. GoogleAdsService.SearchStream**
- **Purpose:** Retrieve campaign performance metrics for the last 7 days
- **Metrics Requested:** impressions, clicks, conversions, cost, average_cpc, ctr
- **Query Example:**
  ```
  SELECT campaign.id, campaign.name, campaign.status,
         metrics.impressions, metrics.clicks, metrics.conversions,
         metrics.cost_micros, metrics.average_cpc, metrics.ctr
  FROM campaign
  WHERE campaign.status = 'ENABLED'
    AND segments.date DURING LAST_7_DAYS
  ```
- **Frequency:** 3 times daily
- **Estimated API Units:** ~10-20 per query (depends on campaign count)

**2. AdGroupService.List**
- **Purpose:** Fetch ad group level statistics
- **Metrics Requested:** quality_score, search_impression_share, avg_cpc
- **Use Case:** Identify which ad groups are underperforming
- **Frequency:** 3 times daily
- **Estimated API Units:** ~5-10 per query

**3. KeywordService.List**
- **Purpose:** Retrieve keyword-level performance data
- **Metrics Requested:** impressions, clicks, conversions, cost_per_conversion
- **Use Case:** Find high-performing keywords to increase bids, low-performers to pause
- **Frequency:** 3 times daily
- **Estimated API Units:** ~10-15 per query

**4. CampaignService.Get**
- **Purpose:** Verify current campaign budgets and status before making changes
- **Use Case:** Ensure budget modifications don't violate daily limits
- **Frequency:** 3 times daily
- **Estimated API Units:** ~5 per query

#### WRITE Operations (Optimization Actions):

**5. CampaignService.MutateCampaigns (Budget Updates)**
- **Purpose:** Adjust daily budgets based on ROI performance
- **Conditions for Execution:**
  - Campaign CPL is below $25 target → Increase budget by up to 20%
  - Campaign CPL is above $28 → Decrease budget by up to 20%
  - Total daily spend across all campaigns never exceeds $50
- **Frequency:** Only when performance justifies change (estimated 1-2 campaigns per day)
- **Safety Controls:**
  - Maximum 20% change per optimization run
  - Requires minimum 30 clicks of data before major adjustments
  - Hard cap: No campaign can exceed $25/day budget
- **Estimated API Units:** ~5 per mutation

**6. CampaignService.MutateCampaigns (Pause Campaigns)**
- **Purpose:** Automatically pause severely underperforming campaigns
- **Trigger Condition:** Campaign CPL exceeds $30 for 3 consecutive days
- **Frequency:** Rare - only when performance is poor (estimated 0-2 times per month)
- **Reason:** Prevents continued budget waste on campaigns that aren't delivering value
- **Estimated API Units:** ~5 per mutation

**7. AdService.MutateAds (Create New Ads)**
- **Purpose:** Generate and upload new ad copy variations for A/B testing
- **Status:** New ads are created in PAUSED status (require manual approval before activation)
- **Frequency:** ~3 new ad variations per week
- **Generation Method:** AI analyzes existing high-performing ads and creates variations
- **Approval Process:** Business owner reviews and approves new ads before enabling
- **Estimated API Units:** ~10 per mutation (creating 3 ads)

### 4.2 Real-Time Conversion Tracking

**Frequency:** Every time a website visitor submits the quote request form
**Trigger:** Form submission event
**Duration:** <1 second
**Expected Volume:** 5-20 conversions per day at target performance

#### API Endpoint:

**ConversionUploadService.UploadClickConversions**
- **Purpose:** Upload form submission as a conversion event to Google Ads
- **Data Sent:**
  - `gclid`: Google Click ID captured from ad click
  - `conversion_date_time`: Timestamp of form submission
  - `conversion_value`: $25 (our target cost per lead)
  - `conversion_action`: "Quote Request" conversion action
- **Use Case:** Enable Google's Smart Bidding to optimize toward actual conversions, not just clicks
- **Estimated API Units:** ~5 per conversion upload

### 4.3 Weekly Performance Reporting

**Frequency:** Once per week (Monday mornings at 9 AM EST)
**Trigger:** Vercel Cron Job
**Duration:** 2-3 minutes
**Purpose:** Generate comprehensive weekly performance report

#### API Endpoint:

**GoogleAdsService.SearchStream (Extended Query)**
- **Query Scope:** Full week of data (7 days) with detailed breakdowns
- **Metrics:** All available KPIs aggregated by campaign, ad group, keyword, and day
- **Export Format:** JSON data stored in database for historical analysis
- **Use Case:** Business owner reviews weekly performance trends
- **Estimated API Units:** ~50-100 (comprehensive data pull)

---

## Section 5: API Call Volume Estimates

### 5.1 Current Scale (Months 1-3)

**Campaigns:** 2-3 active campaigns
**Ad Groups:** 5-10 ad groups
**Keywords:** 20-30 keywords

**Daily API Calls:**
- 3 optimization runs × 4 READ queries = 12 read calls
- ~1 budget adjustment = 1 write call
- ~5-10 conversion uploads = 10 write calls
- **Total Daily:** ~50-75 API operations

**Monthly API Calls:**
- Daily operations: ~50 × 30 = 1,500 operations
- Weekly reports: 4 × 100 = 400 operations
- **Total Monthly:** ~2,000 API operations

### 5.2 Projected Scale (Months 6-12)

**Campaigns:** 5-8 active campaigns
**Ad Groups:** 15-25 ad groups
**Keywords:** 50-80 keywords

**Daily API Calls:**
- 3 optimization runs × 6 READ queries = 18 read calls
- ~2-3 budget adjustments = 3 write calls
- ~15-20 conversion uploads = 20 write calls
- **Total Daily:** ~100-150 API operations

**Monthly API Calls:**
- Daily operations: ~125 × 30 = 3,750 operations
- Weekly reports: 4 × 150 = 600 operations
- **Total Monthly:** ~4,500 API operations

**Note:** These volumes are well within Google Ads API standard quotas (millions of operations per day available).

---

## Section 6: Data Flow & Processing

### 6.1 Campaign Performance Analysis Flow

```
Step 1: Cron Trigger (8 AM, 2 PM, 8 PM EST)
   ↓
Step 2: Fetch Campaign Data via Google Ads API
   - Last 7 days performance metrics
   - Current budget and status for each campaign
   - Quality scores and impression share
   ↓
Step 3: Store Raw Data in Database (Supabase)
   - ad_performance table (indexed by campaign_id + date)
   - Preserves historical data for trend analysis
   ↓
Step 4: Calculate Performance Metrics
   - CTR = (clicks / impressions) × 100
   - CPC = cost / clicks
   - Conversion Rate = (conversions / clicks) × 100
   - Cost Per Lead = cost / conversions
   ↓
Step 5: AI Analysis (Anthropic Claude API)
   - Input: Campaign performance data as JSON
   - Processing: Analyze ROI, identify trends, compare to targets
   - Output: Optimization plan with specific recommendations
   ↓
Step 6: Apply Approved Changes via Google Ads API
   - Update budgets (if CPL is below target)
   - Pause campaigns (if CPL exceeds $30)
   - Log all decisions with reasoning
   ↓
Step 7: Store Decision Log in Database
   - ai_optimization_log table
   - Records: action taken, reason, timestamp, result
   - Purpose: Audit trail and transparency
```

### 6.2 Conversion Attribution Flow

```
Step 1: User Clicks Google Ad
   - Ad click redirects to asapjet.flights landing page
   - URL includes gclid parameter (e.g., ?gclid=abc123xyz)
   ↓
Step 2: Landing Page Loads
   - JavaScript extracts gclid from URL
   - gclid stored in browser session storage
   ↓
Step 3: User Browses Site & Submits Lead Form
   - User fills out quote request form
   - Form includes: departure city, destination, date, passenger count, contact info
   ↓
Step 4: Form Submission POST Request
   - Form data + gclid sent to /api/leads endpoint
   - Server validates data and creates lead record
   ↓
Step 5: Create Lead Record in Database
   - leads table: stores customer details, quote request info, timestamp
   - Record assigned unique lead_id
   ↓
Step 6: Create Attribution Record
   - lead_attribution table: links lead_id to gclid
   - Also stores: utm parameters, landing page URL, referrer
   ↓
Step 7: Upload Conversion to Google Ads
   - ConversionUploadService API call with gclid
   - Conversion action: "Quote Request"
   - Conversion value: $25 (our target CPL)
   - Conversion time: Form submission timestamp
   ↓
Step 8: Google Ads Processes Conversion
   - Conversion attributed to original ad click
   - Campaign conversion count incremented
   - Smart Bidding uses this data to optimize future bids
```

---

## Section 7: Security & Compliance

### 7.1 Authentication & Credentials Security

**OAuth 2.0 Implementation:**
- We use OAuth 2.0 authorization code flow with refresh tokens
- Initial authorization performed manually by business owner
- Refresh token stored as encrypted environment variable in Vercel
- Access tokens automatically refreshed when expired (no manual intervention required)

**API Credentials Storage:**
All sensitive credentials stored as environment variables:
- `GOOGLE_ADS_CLIENT_ID` - OAuth client ID
- `GOOGLE_ADS_CLIENT_SECRET` - OAuth client secret (encrypted)
- `GOOGLE_ADS_DEVELOPER_TOKEN` - API developer token (encrypted)
- `GOOGLE_ADS_REFRESH_TOKEN` - OAuth refresh token (encrypted)
- `GOOGLE_ADS_CUSTOMER_ID` - Google Ads customer account ID

**Access Control:**
- Cron endpoints protected with bearer token authentication
- Only authorized Vercel cron jobs can trigger optimization runs
- Admin dashboard requires password authentication
- Database uses Row-Level Security (RLS) to prevent unauthorized access

### 7.2 Budget Safety Controls

To prevent accidental overspending, we implement multiple safeguards:

**Hard Limits:**
- **Daily Total Cap:** $50 - system will never approve changes that exceed this
- **Per-Campaign Cap:** $25 - no single campaign can have daily budget above this
- **Maximum Single Adjustment:** 20% - budget can only change by 20% per optimization run

**Data Thresholds:**
- **Minimum Clicks Required:** 30 clicks before major budget changes
- **Minimum Campaign Age:** 3 days before pausing for poor performance
- **Confidence Interval:** AI must have high confidence (based on data volume) before making changes

**Alert Mechanisms:**
- Email alert sent if daily spend approaches $45 (90% of cap)
- Automatic pause of all campaigns if total daily spend exceeds $50
- Weekly summary report reviewed by business owner

### 7.3 Data Privacy & Compliance

**Personal Information Handling:**
- Lead form data (name, email, phone) stored in Supabase with encryption at rest
- Database access restricted to service role only (no public access)
- Data retention: Leads archived after 90 days of inactivity

**GDPR Compliance:**
- Privacy policy on website explains data collection
- Cookie consent banner for Google Ads tracking
- Users can request data deletion via contact form

**Google Ads Policies:**
- All ads follow Google's advertising policies
- No misleading claims or deceptive practices
- Landing pages provide clear information about services
- Contact information prominently displayed

### 7.4 Error Handling & Monitoring

**Transient Errors (Network Issues, Timeouts):**
- Retry with exponential backoff (3 attempts)
- If all retries fail, log error and alert administrator
- Queue operation for next scheduled run

**Authentication Errors:**
- Attempt automatic token refresh
- If refresh fails, send email alert to business owner
- Pause optimization until credentials are fixed

**API Quota Exceeded:**
- Gracefully handle quota errors
- Queue operations for next available window
- Log incident for review

**Invalid Data or Logic Errors:**
- Validate all data before making API calls
- Rollback database changes if API call fails
- Send detailed error report including stack trace

---

## Section 8: Monitoring, Logging & Transparency

### 8.1 Audit Trail

Every AI decision is logged to the database with complete transparency:

**ai_optimization_log table fields:**
- `timestamp`: When the decision was made
- `action_type`: Type of action (budget_change, pause_campaign, new_ad_copy, etc.)
- `campaign_id`: Which campaign was affected
- `details`: Full details of the change (old value, new value)
- `reason`: AI's explanation for why this change was made
- `applied`: Whether the change was actually executed or just recommended
- `result`: Outcome of the change (success, failure, error details)

**Example Log Entry:**
```
{
  "timestamp": "2024-12-23T14:00:00Z",
  "action_type": "budget_change",
  "campaign_id": "12345678",
  "details": {
    "campaign_name": "ASAP Jet - Last Minute Charters",
    "old_budget": 20.00,
    "new_budget": 24.00,
    "change_percent": 20
  },
  "reason": "Campaign performing well with CPL of $18.50 (below $25 target). Increasing budget to capture more conversions.",
  "applied": true,
  "result": "success"
}
```

### 8.2 Performance Dashboard

Business owner has access to real-time dashboard at `/admin/marketing` showing:
- Current daily spend across all campaigns
- Cost per lead for each campaign
- Recent AI optimization decisions with explanations
- Conversion tracking (which campaigns drove which leads)
- Weekly and monthly performance trends

### 8.3 Alerting System

Email notifications sent for critical events:
- Daily spend approaching limit (>$45)
- Campaign paused due to poor performance
- API authentication errors
- Conversion tracking failures
- Weekly performance summary every Monday

---

## Section 9: Responsible Use Commitment

We commit to using the Google Ads API responsibly and in compliance with all policies:

### 9.1 Advertising Quality
- **No spam:** All ads are relevant to our legitimate business services
- **No deception:** Ads clearly state we are a private charter service
- **Clear pricing:** Landing pages explain that pricing varies by route
- **Honest claims:** We do not make exaggerated or false claims about availability

### 9.2 API Usage
- **Efficient queries:** We batch requests and cache data to minimize API calls
- **Quota respect:** We monitor our usage and stay well within quotas
- **Error handling:** We implement proper retry logic with backoff to avoid overwhelming servers
- **No abuse:** We do not attempt to circumvent rate limits or access unauthorized data

### 9.3 User Privacy
- **Transparent tracking:** Website clearly discloses use of Google Ads conversion tracking
- **Data protection:** Lead information stored securely and used only for quote fulfillment
- **Compliance:** We follow GDPR, CCPA, and other applicable privacy regulations

### 9.4 Human Oversight
- **Weekly review:** Business owner reviews all AI decisions every Monday
- **Manual approval:** New ad copy requires manual approval before activation
- **Intervention capability:** Business owner can disable AI and manually control campaigns at any time
- **Transparency:** All optimization logic is documented and auditable

---

## Section 10: Support & Contact

### 10.1 Technical Support

If Google needs to reach us regarding this API integration:

**Primary Contact:** Jesse (Business Owner)
**Email:** [Available upon request to Google]
**Phone:** [Available upon request to Google]
**Website:** https://asapjet.flights
**Time Zone:** Eastern Time (ET)
**Preferred Contact Method:** Email

### 10.2 Development Team

**Team Size:** 1 developer (business owner is also the developer)
**Development Approach:** Solo development with AI assistance
**Code Repository:** Private GitHub repository
**Code Review:** Available for Google review if requested

### 10.3 Business Registration

**Business Structure:** Sole Proprietorship / LLC
**Years in Operation:** [Current year]
**Primary Business:** Private air charter brokerage
**Website Launch:** [Date]

---

## Conclusion

This application demonstrates our well-planned, security-conscious approach to using the Google Ads API. Our use case is straightforward: we need programmatic access to optimize small-budget campaigns efficiently and track conversions accurately for a legitimate, time-sensitive business.

We have implemented robust safety controls to prevent overspending, maintain comprehensive audit logs for transparency, and commit to responsible use of the API in compliance with all Google policies.

We appreciate your consideration of this application and are available to provide any additional information or clarification needed.

---

**Application Submitted:** December 23, 2024
**Applicant Signature:** Jesse
**Business Name:** ASAP Jet
**Website:** https://asapjet.flights
