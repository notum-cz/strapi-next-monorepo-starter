import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/blockchain/donate
 * Proxy to blockchain service
 * v0: Mock implementation for E2E testing
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // v0: Call blockchain service (or mock for local testing)
    const BLOCKCHAIN_SERVICE_URL = process.env.BLOCKCHAIN_SERVICE_URL || 'http://localhost:3002';

    const response = await fetch(`${BLOCKCHAIN_SERVICE_URL}/donate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Donation proxy error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'PROXY_ERROR',
          message: 'Failed to process donation request',
        },
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Donation endpoint. Use POST with wallet address and amount.',
  });
}
