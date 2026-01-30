/**
 * Google Ads API Connection Test
 *
 * Tests the API connection step by step to diagnose issues
 */

import { NextRequest, NextResponse } from 'next/server';

const GOOGLE_ADS_CONFIG = {
  developerToken: process.env.GOOGLE_ADS_DEVELOPER_TOKEN!,
  clientId: process.env.GOOGLE_ADS_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_ADS_CLIENT_SECRET!,
  refreshToken: process.env.GOOGLE_ADS_REFRESH_TOKEN!,
  managerCustomerId: process.env.GOOGLE_ADS_MANAGER_ID || '8002140933',
  customerId: process.env.GOOGLE_ADS_CUSTOMER_ID!,
};

export async function GET(request: NextRequest) {
  const results: any = {
    timestamp: new Date().toISOString(),
    steps: [],
  };

  // Step 1: Check environment variables
  results.steps.push({
    step: 'Check Environment Variables',
    developerToken: GOOGLE_ADS_CONFIG.developerToken ? '✓ Set' : '✗ Missing',
    clientId: GOOGLE_ADS_CONFIG.clientId ? '✓ Set' : '✗ Missing',
    clientSecret: GOOGLE_ADS_CONFIG.clientSecret ? '✓ Set' : '✗ Missing',
    refreshToken: GOOGLE_ADS_CONFIG.refreshToken ? '✓ Set' : '✗ Missing',
    managerCustomerId: GOOGLE_ADS_CONFIG.managerCustomerId,
    customerId: GOOGLE_ADS_CONFIG.customerId,
  });

  // Step 2: Test OAuth token refresh
  let accessToken: string | null = null;
  try {
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: GOOGLE_ADS_CONFIG.clientId,
        client_secret: GOOGLE_ADS_CONFIG.clientSecret,
        refresh_token: GOOGLE_ADS_CONFIG.refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    const tokenData = await tokenResponse.json();

    if (tokenResponse.ok && tokenData.access_token) {
      accessToken = tokenData.access_token;
      results.steps.push({
        step: 'OAuth Token Refresh',
        status: '✓ Success',
        tokenType: tokenData.token_type,
        expiresIn: tokenData.expires_in,
      });
    } else {
      results.steps.push({
        step: 'OAuth Token Refresh',
        status: '✗ Failed',
        error: tokenData,
      });
      return NextResponse.json(results);
    }
  } catch (error) {
    results.steps.push({
      step: 'OAuth Token Refresh',
      status: '✗ Exception',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return NextResponse.json(results);
  }

  // Step 3: Test API versions (v15, v16, v17)
  const versionsToTest = ['v15', 'v16', 'v17'];
  const customerId = GOOGLE_ADS_CONFIG.customerId.replace(/-/g, '');
  const managerId = GOOGLE_ADS_CONFIG.managerCustomerId.replace(/-/g, '');

  for (const version of versionsToTest) {
    try {
      // Try a simple customer query
      const response = await fetch(
        `https://googleads.googleapis.com/${version}/customers/${customerId}/googleAds:search`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'developer-token': GOOGLE_ADS_CONFIG.developerToken,
            'login-customer-id': managerId,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: 'SELECT customer.id, customer.descriptive_name FROM customer LIMIT 1',
          }),
        }
      );

      const responseText = await response.text();
      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch {
        responseData = responseText.substring(0, 500);
      }

      results.steps.push({
        step: `API Test - ${version}`,
        status: response.ok ? '✓ Success' : `✗ Failed (${response.status})`,
        response: responseData,
      });

      if (response.ok) {
        results.workingVersion = version;
        break;
      }
    } catch (error) {
      results.steps.push({
        step: `API Test - ${version}`,
        status: '✗ Exception',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Step 4: Try listing accessible customers (different endpoint)
  try {
    const response = await fetch(
      `https://googleads.googleapis.com/v17/customers:listAccessibleCustomers`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'developer-token': GOOGLE_ADS_CONFIG.developerToken,
          'Content-Type': 'application/json',
        },
      }
    );

    const responseText = await response.text();
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = responseText.substring(0, 500);
    }

    results.steps.push({
      step: 'List Accessible Customers',
      status: response.ok ? '✓ Success' : `✗ Failed (${response.status})`,
      response: responseData,
    });
  } catch (error) {
    results.steps.push({
      step: 'List Accessible Customers',
      status: '✗ Exception',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }

  return NextResponse.json(results, { status: 200 });
}
