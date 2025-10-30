import { NextRequest, NextResponse } from 'next/server';
import { generateEnv, type GenerateEnvOptions } from '@/lib/envgen';
import { z } from 'zod';

const GenerateEnvSchema = z.object({
  stack: z.union([z.string(), z.array(z.string())]).optional(),
  overrides: z.record(z.string()).optional(),
  includeComments: z.boolean().optional().default(true),
  includeDefaults: z.boolean().optional().default(false),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = GenerateEnvSchema.parse(body);

    const result = generateEnv(validated as GenerateEnvOptions);

    return NextResponse.json(
      {
        success: true,
        content: result.content,
        variables: result.variables,
        warnings: result.warnings,
        errors: result.errors,
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

    // Never log the actual values
    console.error('Generate env error:', error instanceof Error ? error.message : 'Unknown');

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate .env',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    {
      message: 'POST to this endpoint with stack and overrides to generate .env content',
      example: {
        stack: ['nextjs', 'supabase'],
        overrides: {
          DATABASE_URL: 'postgresql://...',
        },
        includeComments: true,
        includeDefaults: false,
      },
    },
    { status: 200 }
  );
}
