import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://xgbylmnkwqzsacszkpkt.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhnYnlsbW5rd3F6c2Fjc3prcGt0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0NzIyMDAsImV4cCI6MjA3NzA0ODIwMH0.24nwLvUZv5xkgo3WLIrZ0uy7TyvdFTCCPykWvj9t9yI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

export default supabase;
