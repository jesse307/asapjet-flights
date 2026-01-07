import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';

// Initialize Anthropic client
const getAnthropicClient = () => {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new Anthropic({ apiKey });
};

// Initialize Supabase client only if credentials are available
const getSupabaseClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key || url === '' || key === '') {
    return null;
  }

  return createClient(url, key);
};

export async function POST(req: NextRequest) {
  try {
    const { messages, context, llcData } = await req.json();

    // Check if Anthropic client is available
    const anthropic = getAnthropicClient();
    if (!anthropic) {
      return NextResponse.json(
        { error: 'Anthropic API key is not configured. Please set ANTHROPIC_API_KEY in your environment variables.' },
        { status: 500 }
      );
    }

    // Fetch relevant data from Supabase based on context
    const contextData = await fetchContextData(context);

    // Build system prompt with context
    const systemPrompt = buildSystemPrompt(context, contextData, llcData);

    // Call Claude API
    try {
      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 2048,
        system: systemPrompt,
        messages: messages.map((msg: any) => ({
          role: msg.role === 'assistant' ? 'assistant' : 'user',
          content: msg.content,
        })),
      });

      const assistantMessage = response.content[0].type === 'text'
        ? response.content[0].text
        : 'I apologize, but I encountered an error generating a response.';

      // Check if this is an LLC creation request
      const userMessage = messages[messages.length - 1]?.content?.toLowerCase() || '';
      const isLLCCreation = userMessage.includes('create') && (userMessage.includes('llc') || userMessage.includes('entity'));

      return NextResponse.json({
        message: assistantMessage,
        action: isLLCCreation && !llcData ? 'start_llc_creation' : undefined
      });
    } catch (apiError: any) {
      console.error('Anthropic API error:', apiError);
      const errorMsg = apiError?.message || apiError?.error?.message || 'Anthropic API request failed';
      return NextResponse.json(
        { error: `API Error: ${errorMsg}` },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Chat API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate response';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

async function fetchContextData(context: string) {
  const data: any = {
    entities: [],
    contracts: [],
    bills: [],
    stats: {},
  };

  // Get Supabase client
  const supabase = getSupabaseClient();
  if (!supabase) {
    console.warn('Supabase not configured, using empty data');
    return data;
  }

  try {
    // Fetch entities
    const { data: entities } = await supabase
      .from('entities')
      .select('*')
      .order('next_compliance_date', { ascending: true });
    data.entities = entities || [];

    // Fetch contracts
    const { data: contracts } = await supabase
      .from('contracts')
      .select('*')
      .order('expiration_date', { ascending: true });
    data.contracts = contracts || [];

    // Fetch bills
    const { data: bills } = await supabase
      .from('legal_bills')
      .select('*')
      .order('due_date', { ascending: true });
    data.bills = bills || [];

    // Calculate statistics
    const today = new Date();
    const next30Days = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    const next90Days = new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000);

    data.stats = {
      totalEntities: data.entities.length,
      entitiesDueSoon: data.entities.filter(
        (e: any) => new Date(e.next_compliance_date) <= next30Days
      ).length,
      totalContracts: data.contracts.length,
      contractsExpiringSoon: data.contracts.filter(
        (c: any) => c.status === 'active' && new Date(c.expiration_date) <= next90Days
      ).length,
      autoRenewalContracts: data.contracts.filter(
        (c: any) => c.auto_renew
      ).length,
      totalContractValue: data.contracts
        .filter((c: any) => c.status === 'active')
        .reduce((sum: number, c: any) => sum + (c.contract_value || 0), 0),
      totalBills: data.bills.length,
      pendingBills: data.bills.filter((b: any) => b.status === 'pending').length,
      totalOutstanding: data.bills
        .filter((b: any) => b.status === 'pending')
        .reduce((sum: number, b: any) => sum + b.amount, 0),
      billsDueSoon: data.bills.filter(
        (b: any) => b.status === 'pending' && new Date(b.due_date) <= next30Days
      ).length,
    };
  } catch (error) {
    console.error('Error fetching context data:', error);
  }

  return data;
}

function buildSystemPrompt(context: string, data: any, llcData?: any): string {
  let llcContext = '';

  if (llcData) {
    llcContext = `

**LLC CREATION IN PROGRESS:**
The user is creating a new LLC. Here's what we have so far:
${llcData.homeState ? `- Home State: ${llcData.homeState}` : '- Home State: NOT YET PROVIDED'}
${llcData.qualifyStates ? `- Qualification States: ${llcData.qualifyStates}` : '- Qualification States: NOT YET PROVIDED'}
${llcData.internalOwner ? `- Internal Owner: ${llcData.internalOwner}` : '- Internal Owner: NOT YET PROVIDED'}
${llcData.businessPurpose ? `- Business Purpose: ${llcData.businessPurpose}` : '- Business Purpose: NOT YET PROVIDED'}

Ask for the missing information one question at a time. Be conversational and friendly.`;
  }

  const basePrompt = `You are Ledes, an intelligent legal operations assistant for an in-house legal department portal. You help legal professionals with three key capabilities:

1. **Search & Analyze Existing Data**: Query and analyze contracts, entities, and billing records in real-time
2. **Best Practices & Guidance**: Provide legal operations best practices, contract playbook recommendations, and compliance advice
3. **Internal Knowledge**: Help users access internal documents, policies, and company-specific procedures
4. **LLC Creation Workflow**: Guide users through creating new LLCs by collecting: home state, qualification states, internal owner, and business purpose

Your personality:
- Professional yet friendly and approachable
- Concise and action-oriented
- Expert in legal operations, contracts, and compliance
- Proactive in suggesting next steps and best practices

Current date: ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}

CURRENT DATA SNAPSHOT:
${JSON.stringify(data.stats, null, 2)}

ENTITIES:
${data.entities.map((e: any) => `- ${e.company_name} (Home State: ${e.home_state}, Next Compliance: ${e.next_compliance_date}, Owner: ${e.internal_owner || 'Unassigned'})`).join('\n')}

CONTRACTS:
${data.contracts.map((c: any) => `- ${c.contract_name} (${c.contract_type}) with ${c.counterparty}, Value: $${c.contract_value?.toLocaleString()}, Expires: ${c.expiration_date}, Auto-renew: ${c.auto_renew ? 'Yes' : 'No'}, Status: ${c.status}`).join('\n')}

LEGAL BILLS:
${data.bills.map((b: any) => `- ${b.law_firm_name} - Invoice #${b.invoice_number}, Amount: $${b.amount.toLocaleString()}, Due: ${b.due_date}, Status: ${b.status}`).join('\n')}
${llcContext}

Guidelines:

**For Data Queries:**
1. Search and analyze the data provided above accurately
2. Calculate dates and deadlines relative to today's date
3. Provide specific numbers and details from actual records
4. Highlight urgent items (overdue or due within 7 days) proactively
5. Format currency values properly (e.g., $1,500,000 not 1500000)

**For Best Practices & Guidance:**
6. Provide actionable legal operations best practices
7. Offer contract playbook guidance on common clauses (indemnification, liability, IP, etc.)
8. Share negotiation strategies and redlining tips
9. Recommend compliance and governance approaches

**For Internal Knowledge:**
10. Help users understand internal policies and procedures
11. Reference company-specific workflows when relevant
12. Guide users through processes and required fields

**For LLC Creation:**
13. When a user wants to create an LLC, ask for information one question at a time
14. First ask: "What state would you like to incorporate in?"
15. Then ask: "What states will you be operating in (for foreign qualification)?"
16. Then ask: "Who will be the internal owner of this LLC?"
17. Finally ask: "What is the internal business purpose?"
18. Once all info is collected, confirm and let them know a document will be generated

**General:**
19. Keep responses concise (2-4 sentences for simple queries, longer for guidance)
20. Always suggest a logical next action
21. Be proactive in identifying risks and opportunities

Context: User is currently in the "${context}" section of the portal.`;

  return basePrompt;
}
