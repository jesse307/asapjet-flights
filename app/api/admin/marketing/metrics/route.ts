import { NextRequest, NextResponse } from 'next/server';
import { getCampaignPerformance, getTodaySpend, isConfigured } from '@/lib/google-ads';

export async function GET(request: NextRequest) {
  // Verify admin auth
  const authHeader = request.headers.get('authorization');
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword || authHeader !== `Bearer ${adminPassword}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check if Google Ads is configured
  if (!isConfigured()) {
    return NextResponse.json({
      campaigns: [],
      todaySpend: 0,
      configured: false,
      message: 'Google Ads API not configured. Complete the OAuth setup to see metrics.',
    });
  }

  try {
    // Fetch campaign performance from Google Ads
    const campaigns = await getCampaignPerformance(7);
    const todaySpend = await getTodaySpend();

    return NextResponse.json({
      campaigns,
      todaySpend,
      configured: true,
    });
  } catch (error) {
    console.error('Error fetching metrics:', error);
    return NextResponse.json({
      campaigns: [],
      todaySpend: 0,
      configured: true,
      error: error instanceof Error ? error.message : 'Failed to fetch metrics',
    });
  }
}
