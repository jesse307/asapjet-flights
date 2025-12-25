import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyAdminPassword } from '@/lib/auth';
import type { Agent, AgentInput } from '@/types/agent';

// GET /api/admin/agents - List all agents
export async function GET(request: NextRequest) {
  // Verify admin authentication
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const password = authHeader.substring(7);
  if (!verifyAdminPassword(password)) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  try {
    const { data: agents, error } = await supabaseAdmin
      .from('agents')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Agents API] Error fetching agents:', error);
      return NextResponse.json({ error: 'Failed to fetch agents' }, { status: 500 });
    }

    return NextResponse.json({ agents });
  } catch (error) {
    console.error('[Agents API] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/admin/agents - Create a new agent
export async function POST(request: NextRequest) {
  // Verify admin authentication
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const password = authHeader.substring(7);
  if (!verifyAdminPassword(password)) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  try {
    const body: AgentInput = await request.json();

    // Validate required fields
    if (!body.name || !body.email || !body.phone) {
      return NextResponse.json(
        { error: 'Name, email, and phone are required' },
        { status: 400 }
      );
    }

    // If setting this agent as on_call, unset all other agents
    if (body.on_call) {
      const { error: updateError } = await supabaseAdmin
        .from('agents')
        .update({ on_call: false })
        .eq('on_call', true);

      if (updateError) {
        console.error('[Agents API] Error updating on_call status:', updateError);
      }
    }

    const { data: agent, error } = await supabaseAdmin
      .from('agents')
      .insert([body])
      .select()
      .single();

    if (error) {
      console.error('[Agents API] Error creating agent:', error);

      if (error.code === '23505') { // Unique violation
        return NextResponse.json(
          { error: 'An agent with this email already exists' },
          { status: 409 }
        );
      }

      return NextResponse.json({ error: 'Failed to create agent' }, { status: 500 });
    }

    return NextResponse.json({ agent }, { status: 201 });
  } catch (error) {
    console.error('[Agents API] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
