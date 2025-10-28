#!/usr/bin/env node

/**
 * Deployment Verification Script
 * Tests all backend services and database connectivity
 *
 * Usage:
 *   node verify-deployment.js                    # Test local (default)
 *   node verify-deployment.js production         # Test production URLs
 */

const http = require('http');
const https = require('https');

// Configuration
const TIMEOUT = 5000; // 5 seconds

const ENVIRONMENTS = {
  local: {
    'Stellar Agents': 'http://localhost:3004/health',
    'Big-3 Orchestrator': 'http://localhost:3010/health',
    'Browser Service': 'http://localhost:3013/health',
    'Chrome DevTools MCP': 'http://localhost:3014/health',
  },
  production: {
    'Stellar Agents': 'https://stellar-agents-production.up.railway.app/health',
    'Big-3 Orchestrator': 'https://big-3-orchestrator-production.up.railway.app/health',
    'Browser Service': 'https://browser-service-production.up.railway.app/health',
    'Chrome DevTools MCP': 'https://chrome-devtools-mcp-production.up.railway.app/health',
    'Frontend (Vercel)': 'https://strapi-template-new-world-kids.vercel.app',
  },
};

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
 * Make HTTP/HTTPS request with timeout
 */
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const startTime = Date.now();

    const req = protocol.get(url, { timeout: TIMEOUT }, (res) => {
      const duration = Date.now() - startTime;
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          duration,
          data,
        });
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

/**
 * Test a single service
 */
async function testService(name, url) {
  process.stdout.write(`  Testing ${colors.cyan}${name}${colors.reset}... `);

  try {
    const result = await makeRequest(url);

    if (result.statusCode === 200) {
      console.log(`${colors.green}✓ OK${colors.reset} (${result.duration}ms)`);

      // Try to parse JSON response for additional info
      try {
        const json = JSON.parse(result.data);
        if (json.status) {
          console.log(`    Status: ${colors.blue}${json.status}${colors.reset}`);
        }
        if (json.version) {
          console.log(`    Version: ${colors.blue}${json.version}${colors.reset}`);
        }
      } catch (e) {
        // Not JSON, that's fine
      }

      return { success: true, duration: result.duration };
    } else {
      console.log(`${colors.yellow}⚠ Warning${colors.reset} (HTTP ${result.statusCode})`);
      return { success: false, statusCode: result.statusCode };
    }
  } catch (error) {
    console.log(`${colors.red}✗ Failed${colors.reset}`);
    console.log(`    Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * Test database connectivity
 */
async function testDatabase() {
  console.log(`\n${colors.blue}Testing Database Connection...${colors.reset}`);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://sbbuxnyvflczfzvsglpe.supabase.co';

  try {
    const result = await makeRequest(`${supabaseUrl}/rest/v1/`);

    if (result.statusCode === 200 || result.statusCode === 401) {
      // 401 is expected without auth, but means endpoint is reachable
      console.log(`  ${colors.green}✓ Supabase API reachable${colors.reset}`);
      console.log(`    URL: ${colors.blue}${supabaseUrl}${colors.reset}`);
      return true;
    } else {
      console.log(`  ${colors.red}✗ Unexpected response${colors.reset} (HTTP ${result.statusCode})`);
      return false;
    }
  } catch (error) {
    console.log(`  ${colors.red}✗ Connection failed${colors.reset}`);
    console.log(`    Error: ${error.message}`);
    return false;
  }
}

/**
 * Main verification function
 */
async function verify() {
  const env = process.argv[2] || 'local';

  console.log(`${colors.cyan}╔════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.cyan}║   Stellar Agentic Cockpit - Deployment Check  ║${colors.reset}`);
  console.log(`${colors.cyan}╚════════════════════════════════════════════════╝${colors.reset}\n`);

  console.log(`Environment: ${colors.blue}${env}${colors.reset}\n`);

  if (!ENVIRONMENTS[env]) {
    console.log(`${colors.red}Error: Unknown environment "${env}"${colors.reset}`);
    console.log(`Available: ${Object.keys(ENVIRONMENTS).join(', ')}`);
    process.exit(1);
  }

  const services = ENVIRONMENTS[env];
  const results = [];

  // Test all services
  console.log(`${colors.blue}Testing Backend Services...${colors.reset}\n`);

  for (const [name, url] of Object.entries(services)) {
    const result = await testService(name, url);
    results.push({ name, ...result });
  }

  // Test database
  await testDatabase();

  // Summary
  console.log(`\n${colors.cyan}════════════════════════════════════════════════${colors.reset}\n`);
  console.log(`${colors.blue}Summary:${colors.reset}\n`);

  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  console.log(`  Total Services: ${results.length}`);
  console.log(`  ${colors.green}Successful: ${successful}${colors.reset}`);

  if (failed > 0) {
    console.log(`  ${colors.red}Failed: ${failed}${colors.reset}`);
  }

  // Calculate average response time
  const avgDuration = results
    .filter(r => r.duration)
    .reduce((sum, r) => sum + r.duration, 0) / results.filter(r => r.duration).length;

  if (avgDuration) {
    console.log(`  Average Response Time: ${Math.round(avgDuration)}ms`);
  }

  console.log(`\n${colors.cyan}════════════════════════════════════════════════${colors.reset}\n`);

  if (failed === 0) {
    console.log(`${colors.green}✓ All services are healthy!${colors.reset}\n`);
    process.exit(0);
  } else {
    console.log(`${colors.red}✗ Some services failed health checks${colors.reset}\n`);
    console.log(`${colors.yellow}Check the errors above and review your deployment.${colors.reset}\n`);
    process.exit(1);
  }
}

// Run verification
verify().catch((error) => {
  console.error(`${colors.red}Verification failed:${colors.reset}`, error);
  process.exit(1);
});
