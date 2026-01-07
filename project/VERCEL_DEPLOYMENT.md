# Vercel Deployment Guide

Your code has been pushed to GitHub! Now let's deploy to Vercel.

## Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard:**
   - Visit https://vercel.com/new
   - Sign in with your GitHub account if needed

2. **Import Your Project:**
   - Click "Import Project"
   - Select "Import Git Repository"
   - Choose the repository: `jesse307/project`
   - Click "Import"

3. **Configure Project:**
   - Framework Preset: Next.js (should auto-detect)
   - Root Directory: `./` (default)
   - Build Command: `next build` (default)
   - Output Directory: `.next` (default)

4. **Add Environment Variables:**
   Click "Environment Variables" and add these two variables:

   **Variable 1:**
   - Name: `NEXT_PUBLIC_SUPABASE_URL`
   - Value: `https://pozzeqqljpzpkhhtrxss.supabase.co`
   - Environments: Production, Preview, Development (check all)

   **Variable 2:**
   - Name: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvenplcXFsanB6cGtoaHRyeHNzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzczNTUxNCwiZXhwIjoyMDgzMzExNTE0fQ.N2usAO7ZHxVNB7ujTcyZECDS5cXzscg_RE0QO_Pt7Lo`
   - Environments: Production, Preview, Development (check all)

5. **Deploy:**
   - Click "Deploy"
   - Wait for the build to complete (usually 1-2 minutes)
   - Your app will be live at `https://project-xxx.vercel.app`

## Option 2: Deploy via Vercel CLI

If you have npm/node installed and want to use the CLI:

```bash
cd project

# Install Vercel CLI globally (if not already installed)
npm install -g vercel

# Login to Vercel
vercel login

# Add environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL production
# When prompted, enter: https://pozzeqqljpzpkhhtrxss.supabase.co

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
# When prompted, enter the long JWT token from above

# Deploy to production
vercel --prod
```

## After Deployment

1. **Set up the database** (if you haven't already):
   - Follow the instructions in `DATABASE_SETUP.md`
   - Run the schema and seed SQL in your Supabase dashboard

2. **Test your deployment:**
   - Visit your Vercel URL
   - Click on "Entity Management"
   - You should see the 10 demo companies!

## Automatic Deployments

Now that your project is connected to Vercel:
- Every push to the `main` branch will automatically deploy to production
- Pull requests will get preview deployments
- You can manage deployments at https://vercel.com/dashboard
