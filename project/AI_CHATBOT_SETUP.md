# Ledes AI Chatbot Setup Guide

This guide will help you set up the intelligent AI chatbot powered by Claude (Anthropic).

## Overview

The Ledes AI chatbot is an intelligent assistant that:
- Has real-time access to your Supabase database
- Understands your contracts, entities, and billing data
- Provides contextual answers based on actual data
- Offers legal operations guidance and insights
- Maintains conversation history for context-aware responses

## Prerequisites

1. A Supabase project with data (see DATABASE_SETUP.md)
2. An Anthropic API account

## Step 1: Get Your Anthropic API Key

1. Go to [https://console.anthropic.com/](https://console.anthropic.com/)
2. Sign up or log in to your account
3. Navigate to API Keys section
4. Click "Create Key"
5. Copy your API key (it starts with `sk-ant-`)

**Pricing Information:**
- Claude 3.5 Sonnet costs approximately $3 per million input tokens
- $15 per million output tokens
- Typical chat interactions cost less than $0.01 each
- You can set usage limits in the Anthropic Console

## Step 2: Configure Environment Variables

1. Copy the example environment file:
```bash
cp .env.local.example .env.local
```

2. Edit `.env.local` and add your keys:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Anthropic API Key
ANTHROPIC_API_KEY=sk-ant-your-api-key-here
```

## Step 3: Restart Your Development Server

If your dev server is running, restart it to pick up the new environment variables:

```bash
# Stop the current server (Ctrl+C)
# Then restart
npm run dev
```

## Step 4: Test the Chatbot

1. Open your application at [http://localhost:3000](http://localhost:3000)
2. Click the purple chat button in the bottom-right corner
3. Try these example queries:

**Data Queries:**
- "How many contracts are expiring in the next 90 days?"
- "Which entities have compliance dates coming up?"
- "Show me the total outstanding legal bills"
- "Which contracts have auto-renewal enabled?"

**Insights:**
- "What should I prioritize this week?"
- "Are there any overdue items?"
- "Give me a summary of our legal spending"

**Guidance:**
- "How should I handle an indemnification clause?"
- "What are best practices for limitation of liability?"
- "Help me understand contract auto-renewal terms"

## How It Works

### Architecture

```
User Input → LedesChat Component → /api/chat Route → Anthropic API
                                         ↓
                                   Supabase Database
                                         ↓
                                   AI Response
```

1. **LedesChat Component** ([components/LedesChat.tsx](components/LedesChat.tsx))
   - Handles the UI and user interactions
   - Maintains conversation history
   - Sends messages to the API route

2. **API Route** ([app/api/chat/route.ts](app/api/chat/route.ts))
   - Fetches relevant data from Supabase
   - Builds a context-aware system prompt
   - Calls Claude API with conversation history
   - Returns intelligent response

3. **System Prompt**
   - Includes current statistics
   - Lists all entities, contracts, and bills
   - Provides context about the user's current page
   - Sets personality and response guidelines

### Data Access

The chatbot has access to:
- **Entities**: Company names, home states, compliance dates, owners
- **Contracts**: Names, types, counterparties, values, expiration dates, auto-renewal status
- **Legal Bills**: Law firms, invoice numbers, amounts, due dates, status
- **Statistics**: Totals, upcoming deadlines, overdue items

### Context Awareness

The chatbot knows which page the user is on:
- `general` - Home page
- `billing` - Legal Billing module
- `entities` - Entity Management module
- `contracts` - Contracts module

This allows it to provide more relevant responses based on context.

## Customization

### Adjusting AI Personality

Edit the system prompt in [app/api/chat/route.ts](app/api/chat/route.ts:115):

```typescript
Your personality:
- Professional yet friendly and approachable
- Concise and action-oriented
- Knowledgeable about legal operations, contracts, and compliance
- Proactive in suggesting next steps
```

### Changing AI Model

You can switch to different Claude models by editing the API route:

```typescript
const response = await anthropic.messages.create({
  model: 'claude-3-5-sonnet-20241022', // Change this
  // Other options:
  // 'claude-3-opus-20240229' - Most capable, higher cost
  // 'claude-3-haiku-20240307' - Faster, lower cost
  max_tokens: 1024,
  // ...
});
```

### Adding More Context

To give the AI access to additional data, edit the `fetchContextData` function:

```typescript
// Add new data source
const { data: newData } = await supabase
  .from('your_table')
  .select('*');
data.newData = newData || [];
```

Then update the system prompt to include this data.

## Troubleshooting

### Error: "Failed to get response"

**Cause**: Missing or invalid API key

**Solution**:
1. Check that `ANTHROPIC_API_KEY` is set in `.env.local`
2. Verify the key starts with `sk-ant-`
3. Restart your development server

### Error: "Rate limit exceeded"

**Cause**: Too many API calls

**Solution**:
1. Check your usage in Anthropic Console
2. Set up rate limiting in your API route
3. Consider upgrading your Anthropic plan

### Chatbot responses are generic

**Cause**: Not fetching data from Supabase

**Solution**:
1. Verify Supabase credentials in `.env.local`
2. Check browser console for errors
3. Ensure you've run the seed scripts (see DATABASE_SETUP.md)

### Slow responses

**Cause**: Large context or slow API

**Solution**:
1. Reduce the amount of data sent in the system prompt
2. Consider using `claude-3-haiku` for faster responses
3. Implement caching for frequently accessed data

## Security Best Practices

1. **Never commit `.env.local`** - It's in `.gitignore` by default
2. **Rotate API keys regularly** - Anthropic allows multiple keys
3. **Set usage limits** - Use Anthropic Console to set monthly caps
4. **Validate user input** - The API route should sanitize inputs
5. **Monitor costs** - Check your Anthropic dashboard regularly

## Cost Optimization

1. **Use appropriate models**:
   - Haiku: Simple queries ($0.25/$1.25 per MTok)
   - Sonnet: Balanced (current default, $3/$15 per MTok)
   - Opus: Complex reasoning ($15/$75 per MTok)

2. **Reduce context size**:
   - Only send relevant data
   - Limit conversation history
   - Paginate large datasets

3. **Implement caching**:
   - Cache static responses
   - Store frequently accessed data
   - Use Anthropic's prompt caching feature

## Production Deployment

When deploying to production:

1. Set environment variables in your hosting platform:
   - Vercel: Project Settings → Environment Variables
   - Other hosts: Follow their documentation

2. Consider implementing:
   - Rate limiting per user
   - Usage analytics
   - Error monitoring (e.g., Sentry)
   - Response caching

3. Monitor costs and usage:
   - Set up alerts in Anthropic Console
   - Track API calls in your database
   - Review monthly spending

## Support

For issues with:
- **Anthropic API**: https://docs.anthropic.com/
- **Supabase**: https://supabase.com/docs
- **This Application**: Check the GitHub issues

## Example Use Cases

### Contract Analysis
"I have 5 contracts expiring this quarter. Which ones should I prioritize for renewal?"

### Compliance Tracking
"Show me all entities with compliance dates in the next 30 days and their owners."

### Budget Management
"What's our total legal spending for this month and how does it compare to our average?"

### Playbook Guidance
"We're negotiating a service agreement. What should our position be on indemnification clauses?"

---

**Note**: The chatbot is powered by AI and may occasionally provide incorrect information. Always verify important data against your actual records.
