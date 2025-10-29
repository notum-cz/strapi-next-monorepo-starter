import { NextRequest, NextResponse } from 'next/server';
import { validateGitHubToken } from '@/lib/github';
import { z } from 'zod';

const ConnectSchema = z.object({
  tokenType: z.enum(['pat']),
  token: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = ConnectSchema.parse(body);

    // Validate token (in-memory only, never stored)
    const result = await validateGitHubToken(validated.token);

    if (!result.valid) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Invalid GitHub token',
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        scopes: result.scopes,
        message: 'Token validated successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation error',
          details: error.errors,
        },
        { status: 400 }
      );
    }

    console.error('GitHub connect error:', error instanceof Error ? error.message : 'Unknown');

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to validate GitHub token',
      },
      { status: 500 }
    );
  }
}
