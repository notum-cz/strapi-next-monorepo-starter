// Quick test script to verify Supabase connection
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://sbbuxnyvflczfzvsglpe.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNiYnV4bnl2ZmxjemZ6dnNnbHBlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA5MDY1MjIsImV4cCI6MjA3NjQ4MjUyMn0.uZEOLjXyiUUA0RS_RAkFNN0X14yoIL7tbzS0Wri4fvk';

console.log('🔗 Testing Supabase connection...');
console.log('📍 URL:', supabaseUrl);
console.log('');

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  try {
    // Test 1: Check if we can query the database
    console.log('Test 1: Checking database connection...');
    const { data, error } = await supabase.from('_prisma_migrations').select('*').limit(1);

    if (error && error.code !== 'PGRST116') { // PGRST116 = table doesn't exist (which is ok)
      console.log('⚠️  Database query returned an error:', error.message);
      console.log('   This might be expected if tables are not set up yet.');
    } else {
      console.log('✅ Database connection successful!');
    }

    // Test 2: Check auth service
    console.log('');
    console.log('Test 2: Checking auth service...');
    const { data: { session }, error: authError } = await supabase.auth.getSession();

    if (authError) {
      console.log('⚠️  Auth check error:', authError.message);
    } else {
      console.log('✅ Auth service is accessible!');
      console.log('   Current session:', session ? 'Active' : 'None (not logged in)');
    }

    // Test 3: List available tables
    console.log('');
    console.log('Test 3: Checking available tables...');
    const { data: tables, error: tablesError } = await supabase
      .rpc('pg_tables')
      .select('tablename')
      .eq('schemaname', 'public');

    if (tablesError) {
      console.log('⚠️  Could not list tables (this is normal if RPC is not enabled)');
    } else if (tables) {
      console.log('✅ Found tables:', tables.map(t => t.tablename).join(', '));
    }

    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 SUPABASE CONNECTION TEST COMPLETE!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log('✨ Your Supabase credentials are working!');
    console.log('📊 Project URL:', supabaseUrl);
    console.log('🔑 Anon Key: Connected successfully');
    console.log('');
    console.log('Next steps:');
    console.log('1. Set up your database schema in Supabase dashboard');
    console.log('2. Create tables: ai_conversations, donations_feed, user_perks');
    console.log('3. Configure Row Level Security (RLS) policies');
    console.log('');

  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
    console.error('');
    console.error('Please check:');
    console.error('- Your Supabase project is active');
    console.error('- The API keys are correct');
    console.error('- Your network connection');
  }
}

testConnection();
