# ASAP Jet Deployment & Configuration Checklist

## Issues Fixed in This Update

### 1. Environment Variable Prefix Fixed
- **Fixed:** Typo in Supabase environment variable prefix (`asapflight_` → `asapflights_`)
- **Files:** `lib/leads-store.ts`
- **Impact:** This was likely preventing proper database connection from Vercel

### 2. Email Notifications Enhanced
- **Added:** Comprehensive logging to diagnose email failures
- **Files:** `lib/notifications.ts`
- **Logs now show:**
  - Which environment variables are missing
  - Whether email was sent successfully
  - Resend API response IDs
  - Detailed error messages

### 3. Removed Bland AI Integration
- **Removed:** Bland AI voice notification code
- **Removed:** `/api/bland/notify` endpoint
- **Reason:** No longer in use

### 4. Added VAPI Integration
- **New:** Complete VAPI voice notification system
- **New:** Phone call logging to database
- **New:** Webhook endpoint for call status updates
- **New:** Admin dashboard displays call logs

## Required Steps to Deploy

### Step 1: Update Supabase Schema

Run this SQL in your Supabase SQL Editor to add the call_logs table:

\`\`\`sql
-- Create call_logs table for VAPI phone call tracking
CREATE TABLE IF NOT EXISTS call_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  call_id TEXT UNIQUE NOT NULL,
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  duration INTEGER,
  cost NUMERIC(10, 4),
  error TEXT,
  transcript TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_call_logs_call_id ON call_logs(call_id);
CREATE INDEX IF NOT EXISTS idx_call_logs_lead_id ON call_logs(lead_id);
CREATE INDEX IF NOT EXISTS idx_call_logs_timestamp ON call_logs(timestamp DESC);

ALTER TABLE call_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all access for service role" ON call_logs
  FOR ALL
  USING (true)
  WITH CHECK (true);
\`\`\`

### Step 2: Verify Vercel Environment Variables

Check these in your Vercel project settings:

#### Required (for basic functionality)
- ✅ `ADMIN_PASSWORD` - Your admin dashboard password
- ✅ `NEXT_PUBLIC_SUPABASE_URL` or `NEXT_PUBLIC_asapflights_SUPABASE_URL`
- ✅ `SUPABASE_SERVICE_ROLE_KEY` or `asapflights_SUPABASE_SERVICE_ROLE_KEY`

#### For Email Notifications (ALL THREE required)
- ☐ `RESEND_API_KEY` - Your Resend API key
- ☐ `LEADS_NOTIFY_EMAIL_TO` - Your email address (where you receive leads)
- ☐ `LEADS_NOTIFY_EMAIL_FROM` - Verified sender email in Resend (e.g., leads@yourdomain.com)

#### For VAPI Voice Notifications (ALL THREE required)
- ☐ `VAPI_API_KEY` - Your VAPI API key from vapi.ai
- ☐ `VAPI_PHONE_NUMBER_ID` - Your VAPI phone number ID
- ☐ `VAPI_NOTIFY_PHONE` - Your phone number in E.164 format (e.g., +15551234567)

#### Optional
- ☐ `N8N_WEBHOOK_URL` - Webhook URL for n8n or other integrations
- ☐ `NEXT_PUBLIC_CONTACT_PHONE` - Phone number displayed on the website

### Step 3: Configure VAPI Webhook (if using VAPI)

1. Log in to your VAPI dashboard at [vapi.ai](https://vapi.ai)
2. Go to your account settings or phone number settings
3. Set the webhook URL to: `https://your-domain.com/api/vapi/webhook`
4. This webhook receives call status updates (started, ended, failed) and logs them to your database

### Step 4: Deploy to Vercel

1. Push all changes to your GitHub repository
2. Vercel will automatically deploy the changes
3. Verify the deployment completes successfully

### Step 5: Test the System

1. Submit a test lead through the form
2. Check Vercel logs for diagnostic output:
   - Look for `[Notifications]` logs showing which notifications are enabled/skipped
   - Look for `[Email]` logs showing Resend API activity
   - Look for `[VAPI]` logs showing call initiation
3. Check your email inbox
4. Check your phone for VAPI call (if configured)
5. Check admin dashboard to verify:
   - Lead was saved
   - Call logs appear (if VAPI configured)

## Diagnostic Logs to Check in Vercel

After a lead is submitted, you should see logs like this:

### If Everything is Configured Correctly:
\`\`\`
[Notifications] Starting notifications for lead: abc-123-def
[Notifications] Email notification enabled
[Email] Initializing Resend with key: re_abc123...
[Email] Sending email from: leads@yourdomain.com to: you@email.com
[Email] Email sent successfully. ID: xyz
[Notifications] VAPI voice notification enabled
[VAPI] Initiating call to: +15551234567
[VAPI] Call initiated successfully. Call ID: call_abc123
[VAPI] Call logged to database
[Notifications] All notifications processed
\`\`\`

### If Email is Not Configured:
\`\`\`
[Notifications] Starting notifications for lead: abc-123-def
[Notifications] Email notification skipped - missing env vars: {
  hasResendKey: true,
  hasEmailTo: false,
  hasEmailFrom: true
}
\`\`\`

### If VAPI is Not Configured:
\`\`\`
[Notifications] VAPI voice notification skipped - missing env vars: {
  hasVapiKey: true,
  hasPhoneNumberId: false,
  hasNotifyPhone: true
}
\`\`\`

## Files Changed

- `lib/leads-store.ts` - Fixed environment variable prefix
- `lib/notifications.ts` - Removed Bland, added VAPI, added comprehensive logging
- `app/api/vapi/webhook/route.ts` - NEW: VAPI webhook handler for call status
- `app/api/admin/call-logs/route.ts` - NEW: API to fetch call logs for admin
- `app/admin/leads/page.tsx` - Added call logs display
- `supabase-schema.sql` - Added call_logs table schema
- `README.md` - Updated documentation
- Removed: `app/api/bland/` - Bland integration removed

## Common Issues & Solutions

### Email Not Sending
1. Check all three email env vars are set in Vercel
2. Verify sender email is verified in Resend
3. Check Vercel logs for `[Email]` error messages
4. Verify Resend API key is valid

### VAPI Calls Not Working
1. Verify all three VAPI env vars are set
2. Check VAPI dashboard for API key validity
3. Verify phone number format is E.164 (+15551234567)
4. Check Vercel logs for `[VAPI]` error messages
5. Ensure VAPI account has sufficient credits

### Call Logs Not Appearing
1. Verify Supabase schema was updated (Step 1)
2. Check VAPI webhook is configured to point to your domain
3. Check Vercel logs for `[VAPI Webhook]` messages
4. Verify Supabase connection is working

## Need Help?

If you're still experiencing issues after following this checklist:
1. Check Vercel deployment logs
2. Check Vercel function logs for the specific request
3. Verify all environment variables are set correctly
4. Test each notification channel independently
