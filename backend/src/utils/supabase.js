const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || 'https://xgbylmnkwqzsacszkpkt.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhnYnlsbW5rd3F6c2Fjc3prcGt0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0NzIyMDAsImV4cCI6MjA3NzA0ODIwMH0.24nwLvUZv5xkgo3WLIrZ0uy7TyvdFTCCPykWvj9t9yI';

// Create Supabase client with service role key (bypasses RLS)
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Health check
async function healthCheck() {
  try {
    const { data, error } = await supabase.from('users').select('count').limit(1);
    if (error) throw error;
    return { connected: true, error: null };
  } catch (error) {
    return { connected: false, error: error.message };
  }
}

// Test connection on startup
healthCheck().then(({ connected, error }) => {
  if (connected) {
    console.log('✅ Supabase connected successfully');
  } else {
    console.error('❌ Supabase connection failed:', error);
  }
});

module.exports = {
  supabase,
  healthCheck
};
