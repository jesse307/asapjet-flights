import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyAdminPassword } from '@/lib/auth';
import type { AgentUpdate } from '@/types/agent';

type RouteContext = {
  params: Promise<{ id: string }>;
};

// Verify admin authentication helper
function verifyAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }
  const password = authHeader.substring(7);
  return verifyAdminPassword(password);
}

// GET /api/admin/agents/[id] - Get a specific agent
export async function GET(request: NextRequest, context: RouteContext) {
  if (!verifyAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await context.params;

    const { data: agent, error } = await supabaseAdmin
      .from('agents')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
      }
      console.error('[Agent API] Error fetching agent:', error);
      return NextResponse.json({ error: 'Failed to fetch agent' }, { status: 500 });
    }

    return NextResponse.json({ agent });
  } catch (error) {
    console.error('[Agent API] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/admin/agents/[id] - Update an agent
export async function PATCH(request: NextRequest, context: RouteContext) {
  if (!verifyAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const body: AgentUpdate = await request.json();

    // If setting this agent as on_call, unset all other agents
    if (body.on_call === true) {
      const { error: updateError } = await supabaseAdmin
        .from('agents')
        .update({ on_call: false })
        .eq('on_call', true)
        .neq('id', id);

      if (updateError) {
        console.error('[Agent API] Error updating on_call status:', updateError);
      }
    }

    const { data: agent, error } = await supabaseAdmin
      .from('agents')
      .update(body)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
      }
      console.error('[Agent API] Error updating agent:', error);
      return NextResponse.json({ error: 'Failed to update agent' }, { status: 500 });
    }

    return NextResponse.json({ agent });
  } catch (error) {
    console.error('[Agent API] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/admin/agents/[id] - Delete an agent
export async function DELETE(request: NextRequest, context: RouteContext) {
  if (!verifyAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try{
    const { id } = await context.params;

    const { error } = await supabaseAdmin
      .from('agents')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('[Agent API] Error deleting agent:', error);
      return NextResponse.json({ error: 'Failed to delete agent' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Agent API] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
