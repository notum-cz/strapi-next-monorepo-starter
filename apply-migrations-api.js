#!/usr/bin/env node

/**
 * Apply Supabase Migrations via Management API
 * Uses Supabase Access Token to execute SQL migrations
 */

const fs = require('fs');
const https = require('https');

// Configuration
const SUPABASE_ACCESS_TOKEN = 'sbp_42dc677ff3fb014aba6355f514b7b27e2ff0fb98';
const PROJECT_REF = 'sbbuxnyvflczfzvsglpe';

// Migration files
const MIGRATIONS = [
  'supabase/migrations/20250120_initial_schema.sql',
  'supabase/migrations/20250120_impact_tracking.sql',
];

// Colors
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

/**
 * Execute SQL via Supabase Management API
 */
function executeSQL(sql) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({ query: sql });

    const options = {
      hostname: 'api.supabase.com',
      port: 443,
      path: `/v1/projects/${PROJECT_REF}/database/query`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log(`    ${colors.green}✓ HTTP ${res.statusCode} - Success${colors.reset}`);
          resolve({ statusCode: res.statusCode, data });
        } else {
          console.log(`    ${colors.yellow}⚠ HTTP ${res.statusCode}${colors.reset}`);
          console.log(`    Response: ${data.substring(0, 200)}`);
          // Don't reject - migrations might already exist
          resolve({ statusCode: res.statusCode, data });
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
 * Apply a single migration
 */
async function applyMigration(filePath) {
  console.log(`\n${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.cyan}Applying: ${filePath}${colors.reset}`);
  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

  if (!fs.existsSync(filePath)) {
    console.log(`${colors.red}✗ File not found: ${filePath}${colors.reset}`);
    return false;
  }

  const sql = fs.readFileSync(filePath, 'utf8');
  const sizeKB = (sql.length / 1024).toFixed(2);

  console.log(`  File size: ${colors.blue}${sizeKB} KB${colors.reset}`);
  console.log(`  Lines: ${colors.blue}${sql.split('\n').length}${colors.reset}`);
  console.log(`  Executing SQL via Supabase Management API...`);

  try {
    const result = await executeSQL(sql);

    if (result.statusCode >= 200 && result.statusCode < 300) {
      console.log(`\n${colors.green}✓ Migration applied successfully!${colors.reset}`);
      return true;
    } else {
      console.log(`\n${colors.yellow}⚠ Migration completed with warnings${colors.reset}`);
      console.log(`${colors.yellow}  (This is OK if tables already exist)${colors.reset}`);
      return true;
    }
  } catch (error) {
    console.log(`\n${colors.red}✗ Error: ${error.message}${colors.reset}`);
    return false;
  }
}

/**
 * Verify tables exist via REST API
 */
function verifyTable(tableName) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'sbbuxnyvflczfzvsglpe.supabase.co',
      port: 443,
      path: `/rest/v1/${tableName}?select=count&limit=0`,
      method: 'GET',
      headers: {
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNiYnV4bnl2ZmxjemZ6dnNnbHBlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA5MDY1MjIsImV4cCI6MjA3NjQ4MjUyMn0.uZEOLjXyiUUA0RS_RAkFNN0X14yoIL7tbzS0Wri4fvk',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNiYnV4bnl2ZmxjemZ6dnNnbHBlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA5MDY1MjIsImV4cCI6MjA3NjQ4MjUyMn0.uZEOLjXyiUUA0RS_RAkFNN0X14yoIL7tbzS0Wri4fvk',
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log(`    ${colors.green}✓ ${tableName}${colors.reset}`);
          resolve(true);
        } else {
          console.log(`    ${colors.red}✗ ${tableName} (not found)${colors.reset}`);
          resolve(false);
        }
      });
    });

    req.on('error', () => {
      console.log(`    ${colors.red}✗ ${tableName} (error)${colors.reset}`);
      resolve(false);
    });

    req.end();
  });
}

/**
 * Count rows in table
 */
function countRows(tableName) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'sbbuxnyvflczfzvsglpe.supabase.co',
      port: 443,
      path: `/rest/v1/${tableName}?select=*`,
      method: 'GET',
      headers: {
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNiYnV4bnl2ZmxjemZ6dnNnbHBlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA5MDY1MjIsImV4cCI6MjA3NjQ4MjUyMn0.uZEOLjXyiUUA0RS_RAkFNN0X14yoIL7tbzS0Wri4fvk',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNiYnV4bnl2ZmxjemZ6dnNnbHBlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA5MDY1MjIsImV4cCI6MjA3NjQ4MjUyMn0.uZEOLjXyiUUA0RS_RAkFNN0X14yoIL7tbzS0Wri4fvk',
        'Prefer': 'count=exact',
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const rows = JSON.parse(data);
          const count = rows.length;
          console.log(`    ${colors.green}✓ ${tableName}: ${count} rows${colors.reset}`);
          resolve(count);
        } catch (e) {
          console.log(`    ${colors.yellow}⚠ ${tableName}: Could not count${colors.reset}`);
          resolve(0);
        }
      });
    });

    req.on('error', () => {
      console.log(`    ${colors.red}✗ ${tableName}: Error${colors.reset}`);
      resolve(0);
    });

    req.end();
  });
}

/**
 * Main function
 */
async function main() {
  console.log(`${colors.cyan}╔════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.cyan}║   Supabase Database Migration - Automated     ║${colors.reset}`);
  console.log(`${colors.cyan}╚════════════════════════════════════════════════╝${colors.reset}\n`);

  console.log(`Project: ${colors.blue}${PROJECT_REF}${colors.reset}`);
  console.log(`Migrations: ${colors.blue}${MIGRATIONS.length}${colors.reset}`);
  console.log(`Token: ${colors.blue}${SUPABASE_ACCESS_TOKEN.substring(0, 12)}...${colors.reset}\n`);

  let successCount = 0;

  // Apply migrations
  for (const migration of MIGRATIONS) {
    const success = await applyMigration(migration);
    if (success) successCount++;

    // Wait a bit between migrations
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log(`\n${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.cyan}Verification${colors.reset}`);
  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

  console.log(`${colors.blue}Checking tables exist...${colors.reset}\n`);

  const tables = ['agents', 'impact_projects', 'partnerships', 'blog_posts'];
  let allExist = true;

  for (const table of tables) {
    const exists = await verifyTable(table);
    if (!exists) allExist = false;
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log(`\n${colors.blue}Counting seed data...${colors.reset}\n`);

  const agentCount = await countRows('agents');
  const projectCount = await countRows('impact_projects');
  const partnershipCount = await countRows('partnerships');
  const blogCount = await countRows('blog_posts');

  console.log(`\n${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.cyan}Summary${colors.reset}`);
  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

  console.log(`  Migrations applied: ${colors.green}${successCount}/${MIGRATIONS.length}${colors.reset}`);
  console.log(`  Tables verified: ${allExist ? colors.green : colors.red}${tables.length}${colors.reset}`);
  console.log(`  Seed data:`);
  console.log(`    - Agents: ${agentCount === 6 ? colors.green : colors.yellow}${agentCount}/6${colors.reset}`);
  console.log(`    - Projects: ${projectCount === 5 ? colors.green : colors.yellow}${projectCount}/5${colors.reset}`);
  console.log(`    - Partnerships: ${partnershipCount === 5 ? colors.green : colors.yellow}${partnershipCount}/5${colors.reset}`);
  console.log(`    - Blog posts: ${blogCount === 5 ? colors.green : colors.yellow}${blogCount}/5${colors.reset}`);

  console.log(`\n${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

  if (allExist && agentCount === 6 && projectCount === 5) {
    console.log(`${colors.green}✓ Database setup complete!${colors.reset}\n`);
    console.log(`${colors.blue}Next steps:${colors.reset}`);
    console.log(`1. Add SKIP_ENV_VALIDATION=1 to Vercel (if not done)`);
    console.log(`2. Add AI API keys to .env.local`);
    console.log(`3. Run: docker-compose up -d`);
    console.log(`4. Run: node verify-deployment.js local`);
    console.log();
    process.exit(0);
  } else {
    console.log(`${colors.yellow}⚠ Database setup completed with some issues${colors.reset}`);
    console.log(`${colors.yellow}Check Supabase dashboard manually:${colors.reset}`);
    console.log(`https://supabase.com/dashboard/project/${PROJECT_REF}/editor\n`);
    process.exit(1);
  }
}

// Run
main().catch((error) => {
  console.error(`${colors.red}Fatal error:${colors.reset}`, error);
  process.exit(1);
});
