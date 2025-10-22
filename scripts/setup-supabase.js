#!/usr/bin/env node

/**
 * Setup Supabase Database Schema
 * Applies the initial migration to create all tables and seed data
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.SUPABASE_URL || 'https://sbbuxnyvflczfzvsglpe.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNiYnV4bnl2ZmxjemZ6dnNnbHBlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDkwNjUyMiwiZXhwIjoyMDc2NDgyNTIyfQ.NwOUhjDQAontS1Ch69lLttLffM1XLxTZg6DZi5ZDMIM';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupDatabase() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🌟 STELLAR AGENTIC COCKPIT - DATABASE SETUP');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  console.log('📍 Supabase URL:', supabaseUrl);
  console.log('');

  // Read migration file
  const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20250120_initial_schema.sql');

  if (!fs.existsSync(migrationPath)) {
    console.error('❌ Migration file not found:', migrationPath);
    process.exit(1);
  }

  const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');

  console.log('📄 Migration file loaded');
  console.log('📊 Size:', Math.round(migrationSQL.length / 1024), 'KB');
  console.log('');

  // Note: Supabase JS client doesn't support raw SQL execution for security
  // You need to run this migration through the Supabase Dashboard SQL Editor
  // or use the Supabase CLI

  console.log('⚠️  IMPORTANT: SQL Migration Instructions');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  console.log('The Supabase JavaScript client does not support executing');
  console.log('raw SQL for security reasons. Please apply the migration using:');
  console.log('');
  console.log('OPTION 1 - Supabase Dashboard (Recommended):');
  console.log('  1. Go to: https://supabase.com/dashboard/project/sbbuxnyvflczfzvsglpe');
  console.log('  2. Click "SQL Editor" in the left sidebar');
  console.log('  3. Create a "New query"');
  console.log('  4. Copy the contents of: supabase/migrations/20250120_initial_schema.sql');
  console.log('  5. Paste and click "Run"');
  console.log('');
  console.log('OPTION 2 - Supabase CLI:');
  console.log('  1. Install: npm install -g supabase');
  console.log('  2. Login: supabase login');
  console.log('  3. Link: supabase link --project-ref sbbuxnyvflczfzvsglpe');
  console.log('  4. Apply: supabase db push');
  console.log('');
  console.log('OPTION 3 - PostgreSQL Client:');
  console.log('  Use psql or any PostgreSQL client to connect and run the migration');
  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');

  // We can still verify the connection and check if tables exist
  console.log('🔍 Checking database connection...');

  try {
    // Try to query a table that should exist after migration
    const { data, error } = await supabase
      .from('agents')
      .select('count');

    if (error) {
      if (error.code === '42P01') { // Table doesn't exist
        console.log('⚠️  Tables not yet created - please run the migration');
      } else {
        console.log('⚠️  Error:', error.message);
      }
    } else {
      console.log('✅ Database is set up and accessible!');

      // Check agents
      const { data: agents, error: agentsError } = await supabase
        .from('agents')
        .select('name, display_name, type, status');

      if (!agentsError && agents && agents.length > 0) {
        console.log('');
        console.log('🌟 Stellar Agents Detected:');
        agents.forEach(agent => {
          console.log(`   • ${agent.display_name} (${agent.type}) - ${agent.status}`);
        });
      }

      // Check services
      const { data: services, error: servicesError } = await supabase
        .from('services')
        .select('display_name, type, status');

      if (!servicesError && services && services.length > 0) {
        console.log('');
        console.log('🔧 Services Registered:');
        services.forEach(service => {
          console.log(`   • ${service.display_name} (${service.type}) - ${service.status}`);
        });
      }
    }

    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✨ Setup check complete!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  } catch (error) {
    console.error('❌ Error checking database:', error.message);
  }
}

setupDatabase();
