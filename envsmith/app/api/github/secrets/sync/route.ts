import { NextRequest, NextResponse } from 'next/server';
import { syncSecretsToGitHub, type GitHubSyncOptions } from '@/lib/github';
import { z } from 'zod';

const SyncSecretsSchema = z.object({
  owner: z.string().min(1),
  repo: z.string().min(1),
  environment: z.string().optional(),
  secrets: z.record(z.string()),
  token: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = SyncSecretsSchema.parse(body);

    // Sync secrets (all processing in-memory)
    const result = await syncSecretsToGitHub(validated as GitHubSyncOptions);

    return NextResponse.json(
      {
        success: result.success,
        synced: result.synced,
        failed: result.failed,
        errors: result.errors,
        message: result.success
          ? `Successfully synced ${result.synced.length} secret(s)`
          : `Failed to sync ${result.failed.length} secret(s)`,
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

    // Never log secret values
    console.error('Sync secrets error:', error instanceof Error ? error.message : 'Unknown');

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to sync secrets to GitHub',
      },
      { status: 500 }
    );
  }
}
