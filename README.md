# ASAP Jet - Rapid Response Private Jet Charter

A high-converting, conversion-first landing page and lead intake system for urgent private jet charter services.

## Features

- **High-Converting Landing Page**: Dark, minimal, operations-focused design
- **Lead Intake Form**: Comprehensive form with validation (Zod)
- **Multi-Channel Notifications**: Email (Resend), SMS (Twilio), and webhook support
- **Admin Dashboard**: Password-protected lead viewer
- **Mobile-First**: Responsive design optimized for mobile devices
- **Persistent Storage**: JSON file-based lead storage (easily swappable)

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Validation**: Zod
- **Email**: Resend (optional)
- **SMS**: Twilio (optional)
- **Webhooks**: n8n or custom endpoint (optional)

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone or download this repository

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

4. Edit `.env.local` and configure your environment variables (see below)

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Environment Variables

### Required

- `ADMIN_PASSWORD`: Password for accessing `/admin/leads` dashboard

### Optional - Email Notifications

If all three are set, email notifications will be sent on lead submission:

- `RESEND_API_KEY`: Your Resend API key
- `LEADS_NOTIFY_EMAIL_TO`: Email address to receive notifications
- `LEADS_NOTIFY_EMAIL_FROM`: Verified sender email address in Resend

### Optional - Voice Notifications (Bland AI)

If both are set, you'll receive a voice call when a lead is submitted:

- `BLAND_API_KEY`: Your Bland AI API key (get from [bland.ai](https://app.bland.ai))
- `BLAND_NOTIFY_PHONE`: Your phone number to call (E.164 format, e.g., +15551234567)

### Optional - Webhook Integration

- `N8N_WEBHOOK_URL`: URL to POST lead JSON payload to (n8n or any webhook endpoint)

### Optional - Public Configuration

- `NEXT_PUBLIC_CONTACT_PHONE`: Phone number displayed on the site (default: +1 (555) 000-0000)

## Project Structure

```
asapjet-flights/
├── app/
│   ├── page.tsx              # Landing page
│   ├── thanks/page.tsx       # Success page
│   ├── admin/leads/page.tsx  # Admin dashboard
│   ├── api/
│   │   ├── leads/route.ts    # Lead submission endpoint
│   │   └── admin/leads/route.ts # Admin API
│   ├── layout.tsx            # Root layout
│   └── globals.css           # Global styles
├── components/
│   ├── HeroSection.tsx       # Hero section
│   ├── LeadForm.tsx          # Lead intake form
│   ├── TrustSection.tsx      # Trust signals
│   ├── HowItWorks.tsx        # Process explanation
│   ├── FAQ.tsx               # FAQ accordion
│   └── Footer.tsx            # Footer with disclaimers
├── lib/
│   ├── validations.ts        # Zod schemas
│   ├── leads-store.ts        # JSON file persistence
│   ├── notifications.ts      # Email/SMS/webhook handlers
│   └── auth.ts               # Simple admin auth
├── types/
│   └── lead.ts               # TypeScript types
└── data/
    └── leads.json            # Persisted leads (auto-created)
```

## Key Routes

- `/` - Landing page with lead form
- `/thanks` - Post-submission success page
- `/admin/leads` - Password-protected admin dashboard
- `/api/leads` - POST endpoint for lead submission
- `/api/admin/leads` - GET endpoint for admin (requires auth)

## Data Storage

Leads are stored in **Supabase** (PostgreSQL), providing a full-featured database with admin UI.

### Setting up Supabase

1. Create a free account at [supabase.com](https://supabase.com)
2. Create a new project
3. Go to the **SQL Editor** in your project dashboard
4. Run the SQL schema from `supabase-schema.sql` to create the `leads` table
5. Go to **Project Settings** → **API** to get your credentials:
   - Copy **Project URL** → use as `NEXT_PUBLIC_SUPABASE_URL`
   - Copy **service_role** key → use as `SUPABASE_SERVICE_ROLE_KEY`
6. Add these environment variables to your deployment platform

### Local Development

For local development, use the same Supabase credentials in your `.env.local` file.

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub (already done!)

2. Import the project in [Vercel](https://vercel.com/new)

3. Configure environment variables:
   - `ADMIN_PASSWORD` - Your admin dashboard password
   - `NEXT_PUBLIC_CONTACT_PHONE` - Phone number displayed on site
   - `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
   - `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key
   - (Optional) `RESEND_API_KEY`, `LEADS_NOTIFY_EMAIL_TO`, `LEADS_NOTIFY_EMAIL_FROM`
   - (Optional) `BLAND_API_KEY`, `BLAND_NOTIFY_PHONE`
   - (Optional) `VAPI_API_KEY`
   - (Optional) `N8N_WEBHOOK_URL`

4. Click "Deploy"

### Other Platforms

This is a standard Next.js app and can be deployed to:
- Netlify
- Railway
- Render
- Any Node.js hosting

Ensure you configure environment variables on your chosen platform.

## Development

### Build

```bash
npm run build
```

### Lint

```bash
npm run lint
```

### Type Check

```bash
npx tsc --noEmit
```

## Admin Dashboard

Access the admin dashboard at `/admin/leads`. You'll be prompted for the password configured in `ADMIN_PASSWORD`.

Features:
- View all lead submissions in a table
- Click any lead to view full details
- See urgency levels, contact info, and notes
- Responsive design

## Notifications

When a lead is submitted:

1. Lead is saved to Supabase (PostgreSQL)
2. If configured, email notification is sent via Resend
3. If configured, voice call notification is made via Bland AI
4. If configured, JSON payload is POSTed to webhook URL
5. User is redirected to `/thanks`

All notifications run asynchronously and won't block the user experience if they fail.

**Voice Call Details:** When Bland AI is configured, you'll receive an automated phone call reading out the lead details including passenger name, route, urgency level, and contact information.

## Customization

### Branding

- Update colors in `app/globals.css` (current accent: `#ff6b35`)
- Modify copy in component files
- Replace contact phone in `.env.local`

### Form Fields

- Edit `types/lead.ts` for data model
- Update `lib/validations.ts` for Zod schema
- Modify `components/LeadForm.tsx` for UI
- Adjust `lib/notifications.ts` for notification content

### Design

All components use Tailwind CSS. Key colors:
- Background: `#1a1a1a`
- Secondary: `#242424`
- Accent: `#ff6b35`
- Text: `#ffffff`

## Security Notes

- Admin authentication is basic (password-only) - suitable for MVP
- For production, consider adding rate limiting to prevent abuse
- Add CAPTCHA if you experience spam
- Review and sanitize all user inputs (Zod validation is in place)
- Keep `ADMIN_PASSWORD` secure and use a strong value

## Legal & Compliance

The site includes appropriate disclaimers about:
- Broker status (not an operator)
- Subject-to-availability language
- No guaranteed timelines
- Part 135 operator partnerships

Review and customize footer disclaimers in `components/Footer.tsx` to match your legal requirements.

## License

Proprietary - All rights reserved

## Support

For issues or questions, contact your development team.
