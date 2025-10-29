import { NextRequest, NextResponse } from 'next/server';
import { createOctokit, getRepoPublicKey, getEnvironmentPublicKey, getRepositoryId } from '@/lib/github';
import { z } from 'zod';

const PublicKeySchema = z.object({
  owner: z.string().min(1),
  repo: z.string().min(1),
  environment: z.string().optional(),
  token: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = PublicKeySchema.parse(body);

    const octokit = createOctokit(validated.token);

    let publicKey;

    if (validated.environment) {
      const repositoryId = await getRepositoryId(octokit, validated.owner, validated.repo);
      publicKey = await getEnvironmentPublicKey(octokit, repositoryId, validated.environment);
    } else {
      publicKey = await getRepoPublicKey(octokit, validated.owner, validated.repo);
    }

    return NextResponse.json(
      {
        success: true,
        publicKey,
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

    console.error('Get public key error:', error instanceof Error ? error.message : 'Unknown');

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get public key',
      },
      { status: 500 }
    );
  }
}
