import { Octokit } from '@octokit/rest';
import sodium from 'libsodium-wrappers-sumo';

export interface GitHubPublicKey {
  key_id: string;
  key: string;
}

export interface GitHubSecret {
  name: string;
  value: string;
}

export interface GitHubSyncOptions {
  owner: string;
  repo: string;
  environment?: string;
  secrets: Record<string, string>;
  token: string;
}

export interface GitHubSyncResult {
  success: boolean;
  synced: string[];
  failed: string[];
  errors: string[];
}

let sodiumReady = false;

/**
 * Initialize libsodium
 */
async function ensureSodiumReady(): Promise<void> {
  if (!sodiumReady) {
    await sodium.ready;
    sodiumReady = true;
  }
}

/**
 * Create Octokit instance with token
 */
export function createOctokit(token: string): Octokit {
  return new Octokit({
    auth: token,
    userAgent: 'EnvSmith/1.0',
  });
}

/**
 * Validate GitHub token scopes
 */
export async function validateGitHubToken(token: string): Promise<{
  valid: boolean;
  scopes: string[];
  error?: string;
}> {
  try {
    const octokit = createOctokit(token);
    const { headers } = await octokit.request('HEAD /');

    const scopes = headers['x-oauth-scopes']
      ? headers['x-oauth-scopes'].split(',').map((s) => s.trim())
      : [];

    // Check for required scopes
    const hasRepo = scopes.includes('repo');
    const hasActions = scopes.some(s => s.includes('actions') || s.includes('workflow'));

    if (!hasRepo && !hasActions) {
      return {
        valid: false,
        scopes,
        error: 'Token requires "repo" or "actions" scope for secret management',
      };
    }

    return { valid: true, scopes };
  } catch (error) {
    return {
      valid: false,
      scopes: [],
      error: error instanceof Error ? error.message : 'Invalid token',
    };
  }
}

/**
 * Get repository public key for encrypting secrets
 */
export async function getRepoPublicKey(
  octokit: Octokit,
  owner: string,
  repo: string
): Promise<GitHubPublicKey> {
  const { data } = await octokit.actions.getRepoPublicKey({
    owner,
    repo,
  });

  return {
    key_id: data.key_id,
    key: data.key,
  };
}

/**
 * Get environment public key for encrypting secrets
 */
export async function getEnvironmentPublicKey(
  octokit: Octokit,
  repositoryId: number,
  environmentName: string
): Promise<GitHubPublicKey> {
  const { data } = await octokit.actions.getEnvironmentPublicKey({
    repository_id: repositoryId,
    environment_name: environmentName,
  });

  return {
    key_id: data.key_id,
    key: data.key,
  };
}

/**
 * Encrypt a secret value using libsodium sealed box
 */
export async function encryptSecret(
  publicKey: string,
  secretValue: string
): Promise<string> {
  await ensureSodiumReady();

  // Convert the public key from base64
  const keyBytes = sodium.from_base64(publicKey, sodium.base64_variants.ORIGINAL);

  // Convert the secret to Uint8Array
  const messageBytes = sodium.from_string(secretValue);

  // Encrypt using sealed box
  const encryptedBytes = sodium.crypto_box_seal(messageBytes, keyBytes);

  // Convert to base64
  return sodium.to_base64(encryptedBytes, sodium.base64_variants.ORIGINAL);
}

/**
 * Create or update a repository secret
 */
export async function createOrUpdateRepoSecret(
  octokit: Octokit,
  owner: string,
  repo: string,
  secretName: string,
  secretValue: string,
  publicKey: GitHubPublicKey
): Promise<void> {
  const encryptedValue = await encryptSecret(publicKey.key, secretValue);

  await octokit.actions.createOrUpdateRepoSecret({
    owner,
    repo,
    secret_name: secretName,
    encrypted_value: encryptedValue,
    key_id: publicKey.key_id,
  });
}

/**
 * Create or update an environment secret
 */
export async function createOrUpdateEnvironmentSecret(
  octokit: Octokit,
  repositoryId: number,
  environmentName: string,
  secretName: string,
  secretValue: string,
  publicKey: GitHubPublicKey
): Promise<void> {
  const encryptedValue = await encryptSecret(publicKey.key, secretValue);

  await octokit.actions.createOrUpdateEnvironmentSecret({
    repository_id: repositoryId,
    environment_name: environmentName,
    secret_name: secretName,
    encrypted_value: encryptedValue,
    key_id: publicKey.key_id,
  });
}

/**
 * Get repository ID by owner and repo name
 */
export async function getRepositoryId(
  octokit: Octokit,
  owner: string,
  repo: string
): Promise<number> {
  const { data } = await octokit.repos.get({
    owner,
    repo,
  });
  return data.id;
}

/**
 * List existing repository secret names (values are not retrievable)
 */
export async function listRepoSecrets(
  octokit: Octokit,
  owner: string,
  repo: string
): Promise<string[]> {
  const { data } = await octokit.actions.listRepoSecrets({
    owner,
    repo,
  });

  return data.secrets.map((s) => s.name);
}

/**
 * List existing environment secret names
 */
export async function listEnvironmentSecrets(
  octokit: Octokit,
  repositoryId: number,
  environmentName: string
): Promise<string[]> {
  const { data } = await octokit.actions.listEnvironmentSecrets({
    repository_id: repositoryId,
    environment_name: environmentName,
  });

  return data.secrets.map((s) => s.name);
}

/**
 * Sync multiple secrets to GitHub
 */
export async function syncSecretsToGitHub(
  options: GitHubSyncOptions
): Promise<GitHubSyncResult> {
  const synced: string[] = [];
  const failed: string[] = [];
  const errors: string[] = [];

  try {
    const octokit = createOctokit(options.token);

    if (options.environment) {
      // Environment secrets
      const repositoryId = await getRepositoryId(octokit, options.owner, options.repo);
      const publicKey = await getEnvironmentPublicKey(
        octokit,
        repositoryId,
        options.environment
      );

      for (const [name, value] of Object.entries(options.secrets)) {
        try {
          await createOrUpdateEnvironmentSecret(
            octokit,
            repositoryId,
            options.environment,
            name,
            value,
            publicKey
          );
          synced.push(name);
        } catch (error) {
          failed.push(name);
          errors.push(`${name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
    } else {
      // Repository secrets
      const publicKey = await getRepoPublicKey(octokit, options.owner, options.repo);

      for (const [name, value] of Object.entries(options.secrets)) {
        try {
          await createOrUpdateRepoSecret(
            octokit,
            options.owner,
            options.repo,
            name,
            value,
            publicKey
          );
          synced.push(name);
        } catch (error) {
          failed.push(name);
          errors.push(`${name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
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
      failed: Object.keys(options.secrets),
      errors: [error instanceof Error ? error.message : 'Unknown error'],
    };
  }
}
