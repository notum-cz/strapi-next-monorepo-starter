import { NextRequest, NextResponse } from 'next/server';
import { syncEnvsToVercel, type VercelSyncOptions, type VercelEnvTarget } from '@/lib/vercel';
import { z } from 'zod';

const VercelEnvItemSchema = z.object({
  key: z.string().min(1),
  value: z.string(),
  target: z.array(z.enum(['development', 'preview', 'production'])),
  type: z.enum(['plain', 'secret', 'encrypted', 'system']).optional(),
  gitBranch: z.string().optional(),
  comment: z.string().optional(),
});

const SyncVercelEnvSchema = z.object({
  projectName: z.string().min(1),
  teamSlug: z.string().optional(),
  teamId: z.string().optional(),
  items: z.array(VercelEnvItemSchema),
  token: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = SyncVercelEnvSchema.parse(body);

    // Sync environment variables (all in-memory)
    const result = await syncEnvsToVercel(validated as VercelSyncOptions);

    return NextResponse.json(
      {
        success: result.success,
        synced: result.synced,
        failed: result.failed,
        errors: result.errors,
        message: result.success
          ? `Successfully synced ${result.synced.length} variable(s)`
          : `Failed to sync ${result.failed.length} variable(s)`,
      },
      { status: result.success ? 200 : 500 }
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

    // Never log environment values
    console.error('Sync Vercel env error:', error instanceof Error ? error.message : 'Unknown');

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to sync environment variables to Vercel',
      },
      { status: 500 }
    );
  }
}
