// ============================================================================
// API Route: Execute Agent Task
// POST /api/agents/[name]/execute
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';

const STELLAR_AGENTS_URL = process.env.STELLAR_AGENTS_URL || 'http://localhost:3004';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const { name } = await params;
    const body = await request.json();

    // Forward request to stellar-agents service
    const response = await fetch(`${STELLAR_AGENTS_URL}/agents/${name}/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(error, { status: response.status });
    }

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
