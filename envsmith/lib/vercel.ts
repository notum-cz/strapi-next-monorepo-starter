export type VercelEnvTarget = 'development' | 'preview' | 'production';
export type VercelEnvType = 'plain' | 'secret' | 'encrypted' | 'system';

export interface VercelEnvVariable {
  key: string;
  value: string;
  type?: VercelEnvType;
  target: VercelEnvTarget[];
  gitBranch?: string;
  comment?: string;
}

export interface VercelSyncOptions {
  projectName: string;
  teamSlug?: string;
  teamId?: string;
  items: VercelEnvVariable[];
  token: string;
}

export interface VercelSyncResult {
  success: boolean;
  synced: string[];
  failed: string[];
  errors: string[];
}

export interface VercelProject {
  id: string;
  name: string;
}

const VERCEL_API_BASE = 'https://api.vercel.com';

/**
 * Build Vercel API URL with optional team context
 */
function buildVercelUrl(
  path: string,
  teamSlug?: string,
  teamId?: string
): string {
  const url = new URL(path, VERCEL_API_BASE);

  if (teamSlug) {
    url.searchParams.set('teamId', teamSlug);
  } else if (teamId) {
    url.searchParams.set('teamId', teamId);
  }

  return url.toString();
}

/**
 * Make a Vercel API request
 */
async function vercelRequest<T = any>(
  path: string,
  options: {
    method?: string;
    token: string;
    teamSlug?: string;
    teamId?: string;
    body?: any;
  }
): Promise<T> {
  const url = buildVercelUrl(path, options.teamSlug, options.teamId);

  const response = await fetch(url, {
    method: options.method || 'GET',
    headers: {
      Authorization: `Bearer ${options.token}`,
      'Content-Type': 'application/json',
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Vercel API error (${response.status}): ${error}`);
  }

  return response.json();
}

/**
 * Get project by name or ID
 */
export async function getVercelProject(
  projectNameOrId: string,
  token: string,
  teamSlug?: string,
  teamId?: string
): Promise<VercelProject> {
  return vercelRequest<VercelProject>(
    `/v9/projects/${encodeURIComponent(projectNameOrId)}`,
    { token, teamSlug, teamId }
  );
}

/**
 * List existing environment variables for a project
 */
export async function listVercelEnvs(
  projectNameOrId: string,
  token: string,
  teamSlug?: string,
  teamId?: string
): Promise<Array<{ key: string; target: VercelEnvTarget[]; type: string; id: string }>> {
  const data = await vercelRequest<{
    envs: Array<{ key: string; target: VercelEnvTarget[]; type: string; id: string }>;
  }>(`/v9/projects/${encodeURIComponent(projectNameOrId)}/env`, {
    token,
    teamSlug,
    teamId,
  });

  return data.envs || [];
}

/**
 * Create or update a single environment variable
 */
export async function upsertVercelEnv(
  projectNameOrId: string,
  env: VercelEnvVariable,
  token: string,
  teamSlug?: string,
  teamId?: string
): Promise<void> {
  const body: any = {
    key: env.key,
    value: env.value,
    type: env.type || 'encrypted',
    target: env.target,
  };

  if (env.gitBranch) {
    body.gitBranch = env.gitBranch;
  }

  if (env.comment) {
    body.comment = env.comment;
  }

  const url = buildVercelUrl(
    `/v10/projects/${encodeURIComponent(projectNameOrId)}/env?upsert=true`,
    teamSlug,
    teamId
  );

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to upsert env ${env.key}: ${error}`);
  }
}

/**
 * Sync multiple environment variables to Vercel project
 */
export async function syncEnvsToVercel(
  options: VercelSyncOptions
): Promise<VercelSyncResult> {
  const synced: string[] = [];
  const failed: string[] = [];
  const errors: string[] = [];

  try {
    // Verify project exists
    await getVercelProject(
      options.projectName,
      options.token,
      options.teamSlug,
      options.teamId
    );

    // Upsert each environment variable
    for (const item of options.items) {
      try {
        await upsertVercelEnv(
          options.projectName,
          item,
          options.token,
          options.teamSlug,
          options.teamId
        );
        synced.push(item.key);
      } catch (error) {
        failed.push(item.key);
        errors.push(
          `${item.key}: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }

    return {
      success: failed.length === 0,
      synced,
      failed,
      errors,
    };
  } catch (error) {
    return {
      success: false,
      synced,
      failed: options.items.map((i) => i.key),
      errors: [error instanceof Error ? error.message : 'Unknown error'],
    };
  }
}

/**
 * Run smoke test: create or update ENVSMITH_SMOKE_TEST variable
 */
export async function runVercelSmokeTest(
  projectName: string,
  teamSlug: string,
  token: string,
  target: VercelEnvTarget = 'development'
): Promise<VercelSyncResult> {
  return syncEnvsToVercel({
    projectName,
    teamSlug,
    items: [
      {
        key: 'ENVSMITH_SMOKE_TEST',
        value: 'ok',
        type: 'encrypted',
        target: [target],
        comment: 'EnvSmith smoke test variable',
      },
    ],
    token,
  });
}

/**
 * Validate Vercel token by attempting to list projects
 */
export async function validateVercelToken(
  token: string,
  teamSlug?: string,
  teamId?: string
): Promise<{ valid: boolean; error?: string }> {
  try {
    await vercelRequest('/v9/projects?limit=1', {
      token,
      teamSlug,
      teamId,
    });
    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Invalid token',
    };
  }
}

/**
 * Convert .env content to Vercel environment variables
 */
export function envToVercelFormat(
  envContent: string,
  targets: VercelEnvTarget[] = ['development', 'preview', 'production']
): VercelEnvVariable[] {
  const lines = envContent.split('\n');
  const variables: VercelEnvVariable[] = [];

  for (let line of lines) {
    line = line.trim();

    // Skip comments and empty lines
    if (!line || line.startsWith('#')) {
      continue;
    }

    const equalIndex = line.indexOf('=');
    if (equalIndex === -1) {
      continue;
    }

    let key = line.substring(0, equalIndex).trim();
    let value = line.substring(equalIndex + 1).trim();

    // Remove quotes if present
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    variables.push({
      key,
      value,
      type: 'encrypted',
      target: targets,
    });
  }

  return variables;
}
