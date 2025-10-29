import { NextRequest, NextResponse } from 'next/server';
import { runVercelSmokeTest } from '@/lib/vercel';
import { z } from 'zod';

const SmokeTestSchema = z.object({
  projectName: z.string().optional(),
  teamSlug: z.string().optional(),
  token: z.string().min(1),
  target: z.enum(['development', 'preview', 'production']).optional().default('development'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = SmokeTestSchema.parse(body);

    // Use defaults from env if not provided
    const projectName =
      validated.projectName ||
      process.env.VERCEL_PROJECT_NAME ||
      'strapi-template-new-world-kids';

    const teamSlug =
      validated.teamSlug ||
      process.env.VERCEL_TEAM_SLUG ||
      'jeremy-bowers-s-projects';

    // Run smoke test
    const result = await runVercelSmokeTest(
      projectName,
      teamSlug,
      validated.token,
      validated.target
    );

    return NextResponse.json(
      {
        success: result.success,
        project: projectName,
        team: teamSlug,
        target: validated.target,
        synced: result.synced,
        failed: result.failed,
        errors: result.errors,
        message: result.success
          ? `Smoke test passed! Created/updated ENVSMITH_SMOKE_TEST=ok on ${projectName} (${validated.target})`
          : 'Smoke test failed',
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

    console.error('Smoke test error:', error instanceof Error ? error.message : 'Unknown');

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Smoke test failed',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    {
      message: 'POST to run smoke test',
      defaults: {
        projectName: process.env.VERCEL_PROJECT_NAME || 'strapi-template-new-world-kids',
        teamSlug: process.env.VERCEL_TEAM_SLUG || 'jeremy-bowers-s-projects',
        target: 'development',
      },
      example: {
        token: 'your_vercel_token',
        projectName: 'optional-project-name',
        teamSlug: 'optional-team-slug',
        target: 'development',
      },
    },
    { status: 200 }
  );
}
