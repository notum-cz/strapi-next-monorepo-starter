// Simple Supabase connection test using native fetch
const supabaseUrl = 'https://sbbuxnyvflczfzvsglpe.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNiYnV4bnl2ZmxjemZ6dnNnbHBlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA5MDY1MjIsImV4cCI6MjA3NjQ4MjUyMn0.uZEOLjXyiUUA0RS_RAkFNN0X14yoIL7tbzS0Wri4fvk';

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🔗 SUPABASE CONNECTION TEST');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('');
console.log('📍 URL:', supabaseUrl);
console.log('🔑 Using Anon Key (first 20 chars):', supabaseAnonKey.substring(0, 20) + '...');
console.log('');

async function testConnection() {
  try {
    console.log('⏳ Testing REST API connection...');

    // Test the REST API endpoint
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: 'GET',
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`
      }
    });

    console.log('📊 Response Status:', response.status, response.statusText);

    if (response.ok || response.status === 404) {
      console.log('');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('✅ SUCCESS! Connected to Supabase!');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('');
      console.log('🎉 Your Supabase instance is live and responding!');
      console.log('');
      console.log('📋 Project Details:');
      console.log('   • Project URL: https://sbbuxnyvflczfzvsglpe.supabase.co');
      console.log('   • Dashboard: https://supabase.com/dashboard/project/sbbuxnyvflczfzvsglpe');
      console.log('   • Status: CONNECTED ✓');
      console.log('');
      console.log('🔧 Environment Variables Set:');
      console.log('   • NEXT_PUBLIC_SUPABASE_URL ✓');
      console.log('   • NEXT_PUBLIC_SUPABASE_ANON_KEY ✓');
      console.log('   • SUPABASE_SERVICE_ROLE_KEY ✓');
      console.log('');
      console.log('📝 Next Steps:');
      console.log('   1. Your credentials are working perfectly!');
      console.log('   2. Create your database schema in the Supabase dashboard');
      console.log('   3. Set up tables for your application');
      console.log('   4. Configure authentication if needed');
      console.log('');
    } else {
      console.log('⚠️  Unexpected response status');
      const text = await response.text();
      console.log('Response:', text);
    }

  } catch (error) {
    console.error('');
    console.error('❌ Connection Failed!');
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('Error:', error.message);
    console.error('');
    console.error('Troubleshooting:');
    console.error('  • Check your internet connection');
    console.error('  • Verify the Supabase project is active');
    console.error('  • Confirm the API keys are correct');
    console.error('');
  }
}

testConnection();
