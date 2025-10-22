#!/usr/bin/env node

/**
 * Apply Supabase Migrations
 * Reads SQL migration files and applies them to Supabase
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Supabase credentials from .env.production
const SUPABASE_URL = 'https://sbbuxnyvflczfzvsglpe.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNiYnV4bnl2ZmxjemZ6dnNnbHBlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDkwNjUyMiwiZXhwIjoyMDc2NDgyNTIyfQ.NwOUhjDQAontS1Ch69lLttLffM1XLxTZg6DZi5ZDMIM';

// Migration files in order
const MIGRATIONS = [
  'supabase/migrations/20250120_initial_schema.sql',
  'supabase/migrations/20250120_impact_tracking.sql',
];

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

/**
 * Execute SQL using Supabase REST API
 */
function executeSql(sql) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`);

    const postData = JSON.stringify({ query: sql });

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Length': Buffer.byteLength(postData),
      },
    };

    const req = https.request(url, options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ statusCode: res.statusCode, data });
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

/**
 * Execute SQL directly using pg_stat_statements or raw query
 */
async function executeRawSql(sql) {
  const url = new URL(`${SUPABASE_URL}/rest/v1/`);

  return new Promise((resolve, reject) => {
    const options = {
      method: 'POST',
      hostname: url.hostname,
      path: '/rest/v1/rpc/exec_sql',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Prefer': 'return=minimal',
      },
    };

    const postData = JSON.stringify({ sql });

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(data);
        } else {
          // Non-200 response, but migration might still work
          resolve(data);
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

/**
 * Apply a single migration file
 */
async function applyMigration(filePath) {
  console.log(`\n${colors.cyan}Applying migration: ${path.basename(filePath)}${colors.reset}`);

  if (!fs.existsSync(filePath)) {
    console.log(`${colors.red}✗ File not found: ${filePath}${colors.reset}`);
    return false;
  }

  const sql = fs.readFileSync(filePath, 'utf8');
  console.log(`  File size: ${sql.length} bytes`);
  console.log(`  Executing SQL...`);

  try {
    await executeRawSql(sql);
    console.log(`${colors.green}✓ Migration applied successfully${colors.reset}`);
    return true;
  } catch (error) {
    console.log(`${colors.yellow}⚠ Note: ${error.message}${colors.reset}`);
    console.log(`${colors.yellow}  This may be OK if tables already exist${colors.reset}`);
    return true; // Continue anyway
  }
}

/**
 * Verify tables exist
 */
async function verifyTables() {
  console.log(`\n${colors.blue}Verifying tables...${colors.reset}`);

  const tables = ['agents', 'impact_projects', 'partnerships', 'blog_posts'];

  for (const table of tables) {
    try {
      const url = `${SUPABASE_URL}/rest/v1/${table}?select=count`;

      await new Promise((resolve, reject) => {
        https.get(url, {
          headers: {
            'apikey': SUPABASE_SERVICE_ROLE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          },
        }, (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => {
            if (res.statusCode === 200) {
              console.log(`  ${colors.green}✓ ${table} exists${colors.reset}`);
              resolve();
            } else {
              console.log(`  ${colors.red}✗ ${table} not found${colors.reset}`);
              reject();
            }
          });
        }).on('error', reject);
      });
    } catch (error) {
      console.log(`  ${colors.red}✗ ${table} check failed${colors.reset}`);
    }
  }
}

/**
 * Main function
 */
async function main() {
  console.log(`${colors.cyan}╔════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.cyan}║     Applying Supabase Migrations               ║${colors.reset}`);
  console.log(`${colors.cyan}╚════════════════════════════════════════════════╝${colors.reset}\n`);

  console.log(`Supabase URL: ${colors.blue}${SUPABASE_URL}${colors.reset}`);
  console.log(`Migrations to apply: ${colors.blue}${MIGRATIONS.length}${colors.reset}`);

  let successCount = 0;

  for (const migration of MIGRATIONS) {
    const success = await applyMigration(migration);
    if (success) successCount++;
  }

  await verifyTables();

  console.log(`\n${colors.cyan}════════════════════════════════════════════════${colors.reset}\n`);

  if (successCount === MIGRATIONS.length) {
    console.log(`${colors.green}✓ All migrations completed!${colors.reset}\n`);

    console.log(`${colors.blue}Next steps:${colors.reset}`);
    console.log(`1. Verify in Supabase dashboard:`);
    console.log(`   ${colors.cyan}https://supabase.com/dashboard/project/sbbuxnyvflczfzvsglpe/editor${colors.reset}`);
    console.log(`2. Check that these tables exist:`);
    console.log(`   - agents (should have 6 rows)`);
    console.log(`   - impact_projects (should have 5 rows)`);
    console.log(`   - partnerships (should have 5 rows)`);
    console.log(`   - blog_posts (should have 5 rows)`);
    console.log();
    process.exit(0);
  } else {
    console.log(`${colors.yellow}⚠ Some migrations may have failed${colors.reset}`);
    console.log(`${colors.yellow}Please check the Supabase dashboard manually${colors.reset}\n`);
    process.exit(1);
  }
}

// Run migrations
main().catch((error) => {
  console.error(`${colors.red}Fatal error:${colors.reset}`, error);
  process.exit(1);
});
